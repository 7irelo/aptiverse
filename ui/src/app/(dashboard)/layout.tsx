import AppBar from "@/components/navigation/AppBar"
import { api } from "@/lib/services/api-client"
import { getSession } from "@/lib/services/auth"
import { redirect } from "next/navigation"
import { PropsWithChildren } from "react"
import DashboardNav from "../../components/navigation/DashboardNav"
import { StudentProvider } from "@/contexts/StudentContext"
import { Student } from "@/types/Student"

const Layout: React.FC<PropsWithChildren> = async ({ children }) => {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  try {
    const student: Student = await api.get<Student>('/students/4')
    
    // Check if student data is valid
    if (!student || !student.id) {
      console.error('Invalid student data received:', student)
      redirect('/login?error=no_student_data')
    }
    
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Wrap with StudentProvider */}
        <StudentProvider initialStudent={student}>
          <DashboardNav />
          <div className="flex-1 flex flex-col min-h-screen ml-0 transition-all duration-300 ease-in-out">
            <AppBar />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </StudentProvider>
      </div>
    )
  } catch (error) {
    console.error('Failed to fetch student data:', error)
    redirect('/login?error=failed_to_fetch_student')
  }
}

export default Layout