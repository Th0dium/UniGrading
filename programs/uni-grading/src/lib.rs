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