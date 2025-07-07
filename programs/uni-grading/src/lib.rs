use anchor_lang::prelude::*;

declare_id!("");

#[program]
pub mod UniGrading {
    use super::*;

    pub fn initialize_classroom(ctx: Context<InitializeClassroom>, classroom_name: String) -> ProgramResult {
        let classroom = &mut ctx.accounts.classroom;
        classroom.name = classroom_name;
        classroom.students = Vec::new();
        Ok(())
    }

    pub fn add_student(ctx: Context<AddStudent>, student_name: String) -> ProgramResult {
        let student = &mut ctx.accounts.student;
        student.name = student_name;
        let mut classroom = &mut ctx.accounts.classroom;
        classroom.students.push(Student {
            name: student_name,
            key: student.key(),
        });
        Ok(())
    }

    pub fn assign_grade(ctx: Context<AssignGrade>, student: Pubkey, grade: u8) -> ProgramResult {
        let classroom = &mut ctx.accounts.classroom;
        let student_account = &mut ctx.accounts.student;

        if !classroom.students.contains(&student) {
            return Err(ErrorCode::StudentNotInClassroom.into());
        }

        student_account.grade = grade;
        Ok(())
    }
    pub fn register(ctx: Context<Authority>) -> ProgramResult {
    let authority = ctx.accounts.authority.key();
    // Lưu trữ thông tin người dùng
    Ok(())
}
}


#[derive(Accounts)]
pub struct InitializeClassroom<'info> {
    #[account(init, payer = authority, space = 8 + 40)]
    pub classroom: Account<'info, Classroom>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddStudent<'info> {
    #[account(mut)]
    pub classroom: Account<'info, Classroom>,
    #[account(init, payer = authority, space = 8 + 40)]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
    #[derive(Accounts)]
pub struct AssignGrade<'info> {
    #[account(mut)]
    pub classroom: Account<'info, Classroom>,
    #[account(mut)]
    pub student: Account<'info, Student>,
}
    #[derive(Accounts)]
pub struct Authority<'info> {
    pub authority: Signer<'info>,
}

#[derive(Debug)]
pub struct User {
    pub authority: Pubkey,
    pub username: String,
}

#[account]
pub struct Classroom {
    id: String,
    name: String,
    students: Vec<Student>,
    teacher: String,
    course: String,
}

#[account]struct Student {
    id: String,
    name: String,
    class: String,
    course: String,
    faculty: String,
}

pub struct Users {
    pub users: Vec<User>,
}

impl Users {
    pub fn new() -> Self {
        Users { users: Vec::new() }
    }

    pub fn add_user(&mut self, user: User) {
        self.users.push(user);
    }

    pub fn get_user(&self, authority: Pubkey) -> Option<&User> {
        self.users.iter().find(|user| user.authority == authority)
    }
}