use anchor_lang::prelude::*;

declare_id!("6NoADMVnvEfJbvzioDo6bhwTMocvUE5Kdfah5AHJhBhq");

#[program]
pub mod UniGrading {
    use super::*;

    pub fn initialize_classroom(
        ctx: Context<InitializeClassroom>,
        classroom_name: String,
        course: String
    ) -> Result<()> {
        let classroom = &mut ctx.accounts.classroom;
        classroom.name = classroom_name;
        classroom.course = course;
        classroom.teacher = ctx.accounts.authority.key();
        classroom.students = Vec::new();
        Ok(())
    }

    pub fn add_student(
        ctx: Context<AddStudent>,
        student_name: String,
        student_id: String
    ) -> Result<()> {
        let student = &mut ctx.accounts.student;
        student.name = student_name;
        student.id = student_id;
        student.grades = Vec::new();

        let classroom = &mut ctx.accounts.classroom;
        classroom.students.push(StudentRef {
            name: student.name.clone(),
            pubkey: student.key(),
        });
        Ok(())
    }

    pub fn assign_grade(
        ctx: Context<AssignGrade>,
        assignment_name: String,
        grade: u8,
        max_grade: u8
    ) -> Result<()> {
        require!(grade <= max_grade, UniGradingError::InvalidGrade);

        let student = &mut ctx.accounts.student;
        let grade_entry = Grade {
            assignment_name,
            grade,
            max_grade,
            timestamp: Clock::get()?.unix_timestamp,
            graded_by: ctx.accounts.teacher.key(),
        };

        student.grades.push(grade_entry);
        Ok(())
    }

    pub fn register_user(
        ctx: Context<RegisterUser>,
        username: String,
        role: UserRole
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.authority.key();
        user.username = username;
        user.role = role;
        user.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}


#[derive(Accounts)]
pub struct InitializeClassroom<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 64 + 4 + 64 + 32 + 4 + 1000 // discriminator + name + course + teacher + students vector
    )]
    pub classroom: Account<'info, Classroom>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddStudent<'info> {
    #[account(mut)]
    pub classroom: Account<'info, Classroom>,
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + 64 + 4 + 64 + 4 + 2000 // discriminator + id + name + grades vector
    )]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignGrade<'info> {
    #[account(mut)]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub teacher: Signer<'info>,
}

#[derive(Accounts)]
pub struct RegisterUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 64 + 1 + 8 // discriminator + authority + username + role + timestamp
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct User {
    pub authority: Pubkey,
    pub username: String,
    pub role: UserRole,
    pub created_at: i64,
}

#[account]
pub struct Classroom {
    pub name: String,
    pub course: String,
    pub teacher: Pubkey,
    pub students: Vec<StudentRef>,
}

#[account]
pub struct Student {
    pub id: String,
    pub name: String,
    pub grades: Vec<Grade>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct StudentRef {
    pub name: String,
    pub pubkey: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Grade {
    pub assignment_name: String,
    pub grade: u8,
    pub max_grade: u8,
    pub timestamp: i64,
    pub graded_by: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum UserRole {
    Teacher,
    Student,
}

#[error_code]
pub enum UniGradingError {
    #[msg("Invalid grade value")]
    InvalidGrade,
    #[msg("Student not found in classroom")]
    StudentNotInClassroom,
    #[msg("Unauthorized access")]
    Unauthorized,
}

