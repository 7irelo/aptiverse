import RootNavbar from '../../components/navigation/RootNavbar'
import { PropsWithChildren } from 'react'

const Layout: React.FC<PropsWithChildren> = ({children}) => {
  return (
    <div>
        <RootNavbar />
        {children}
    </div>
  )
}

export default Layout