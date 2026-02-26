export interface ClassAluno {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  matricula?: string;
  curso?: { id: number; nome: string } | null;
}

export interface Class {
  id: number;
  nome: string;
  professor_id: number;
  teacherName?: string;
  studentsCount?: number;
  alunos?: ClassAluno[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassDTO {
  nome: string;
  professor_id: number;
}

export interface UpdateClassDTO {
  nome?: string;
  professor_id?: number;
}

export interface ClassStudent {
  id: number;
  classId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  enrolledAt: string;
}

export interface AddStudentToClassDTO {
  studentId: number;
}
