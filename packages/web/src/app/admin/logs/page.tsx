import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { LogViewer } from './log-viewer';

const LogsPage: AuthComponent = () => {
  return <LogViewer />;
};

export default withUser(LogsPage, true);
