import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UniGrading } from "../target/types/uni_grading";
import { expect } from "chai";

describe("UniGrading", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.UniGrading as Program<UniGrading>;
  const provider = anchor.getProvider();

  // Test accounts
  let teacher: anchor.web3.Keypair;
  let student: anchor.web3.Keypair;
  let classroom: anchor.web3.Keypair;
  let studentAccount: anchor.web3.Keypair;
  let userAccount: anchor.web3.Keypair;

  beforeEach(async () => {
    teacher = anchor.web3.Keypair.generate();
    student = anchor.web3.Keypair.generate();
    classroom = anchor.web3.Keypair.generate();
    studentAccount = anchor.web3.Keypair.generate();
    userAccount = anchor.web3.Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(teacher.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(student.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
  });

  describe("User Registration", () => {
    it("Should register a teacher", async () => {
      await program.methods
        .registerUser("Teacher John", { teacher: {} })
        .accounts({
          user: userAccount.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, userAccount])
        .rpc();

      const userAccountData = await program.account.user.fetch(userAccount.publicKey);
      expect(userAccountData.username).to.equal("Teacher John");
      expect(userAccountData.authority.toString()).to.equal(teacher.publicKey.toString());
      expect(userAccountData.role).to.deep.equal({ teacher: {} });
    });

    it("Should register a student", async () => {
      const studentUserAccount = anchor.web3.Keypair.generate();
      
      await program.methods
        .registerUser("Student Alice", { student: {} })
        .accounts({
          user: studentUserAccount.publicKey,
          authority: student.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([student, studentUserAccount])
        .rpc();

      const userAccountData = await program.account.user.fetch(studentUserAccount.publicKey);
      expect(userAccountData.username).to.equal("Student Alice");
      expect(userAccountData.role).to.deep.equal({ student: {} });
    });
  });

  describe("Classroom Management", () => {
    beforeEach(async () => {
      // Register teacher first
      await program.methods
        .registerUser("Teacher John", { teacher: {} })
        .accounts({
          user: userAccount.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, userAccount])
        .rpc();
    });

    it("Should initialize a classroom", async () => {
      await program.methods
        .initializeClassroom("Math 101", "Mathematics")
        .accounts({
          classroom: classroom.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, classroom])
        .rpc();

      const classroomData = await program.account.classroom.fetch(classroom.publicKey);
      expect(classroomData.name).to.equal("Math 101");
      expect(classroomData.course).to.equal("Mathematics");
      expect(classroomData.teacher.toString()).to.equal(teacher.publicKey.toString());
      expect(classroomData.students).to.have.length(0);
    });

    it("Should add a student to classroom", async () => {
      // First initialize classroom
      await program.methods
        .initializeClassroom("Math 101", "Mathematics")
        .accounts({
          classroom: classroom.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, classroom])
        .rpc();

      // Add student
      await program.methods
        .addStudent("Alice Smith", "STU001")
        .accounts({
          classroom: classroom.publicKey,
          student: studentAccount.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, studentAccount])
        .rpc();

      const studentData = await program.account.student.fetch(studentAccount.publicKey);
      expect(studentData.name).to.equal("Alice Smith");
      expect(studentData.id).to.equal("STU001");
      expect(studentData.grades).to.have.length(0);

      const classroomData = await program.account.classroom.fetch(classroom.publicKey);
      expect(classroomData.students).to.have.length(1);
      expect(classroomData.students[0].name).to.equal("Alice Smith");
    });
  });

  describe("Grade Management", () => {
    beforeEach(async () => {
      // Setup: Register teacher, create classroom, add student
      await program.methods
        .registerUser("Teacher John", { teacher: {} })
        .accounts({
          user: userAccount.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, userAccount])
        .rpc();

      await program.methods
        .initializeClassroom("Math 101", "Mathematics")
        .accounts({
          classroom: classroom.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, classroom])
        .rpc();

      await program.methods
        .addStudent("Alice Smith", "STU001")
        .accounts({
          classroom: classroom.publicKey,
          student: studentAccount.publicKey,
          authority: teacher.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([teacher, studentAccount])
        .rpc();
    });

    it("Should assign a grade to student", async () => {
      await program.methods
        .assignGrade("Midterm Exam", 85, 100)
        .accounts({
          student: studentAccount.publicKey,
          teacher: teacher.publicKey,
        })
        .signers([teacher])
        .rpc();

      const studentData = await program.account.student.fetch(studentAccount.publicKey);
      expect(studentData.grades).to.have.length(1);
      
      const grade = studentData.grades[0];
      expect(grade.assignmentName).to.equal("Midterm Exam");
      expect(grade.grade).to.equal(85);
      expect(grade.maxGrade).to.equal(100);
      expect(grade.gradedBy.toString()).to.equal(teacher.publicKey.toString());
    });

    it("Should reject invalid grade (over max)", async () => {
      try {
        await program.methods
          .assignGrade("Invalid Test", 110, 100)
          .accounts({
            student: studentAccount.publicKey,
            teacher: teacher.publicKey,
          })
          .signers([teacher])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Invalid grade value");
      }
    });

    it("Should allow multiple grades for same student", async () => {
      // First grade
      await program.methods
        .assignGrade("Quiz 1", 90, 100)
        .accounts({
          student: studentAccount.publicKey,
          teacher: teacher.publicKey,
        })
        .signers([teacher])
        .rpc();

      // Second grade
      await program.methods
        .assignGrade("Quiz 2", 85, 100)
        .accounts({
          student: studentAccount.publicKey,
          teacher: teacher.publicKey,
        })
        .signers([teacher])
        .rpc();

      const studentData = await program.account.student.fetch(studentAccount.publicKey);
      expect(studentData.grades).to.have.length(2);
      expect(studentData.grades[0].assignmentName).to.equal("Quiz 1");
      expect(studentData.grades[1].assignmentName).to.equal("Quiz 2");
    });
  });
});
