import { Router, useRouter } from 'expo-router';

export interface WithRouterProps {
  router: Router;
}

function withRouter<T>(WrappedComponent: React.FunctionComponent<T & WithRouterProps>) {
  return (props: T) => {
    const router = useRouter();

    return WrappedComponent({ ...props, router });
  };
}

export default withRouter;
