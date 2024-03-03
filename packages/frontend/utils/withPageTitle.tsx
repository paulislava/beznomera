import useSetTitle from '@/hooks/useSetTitle';

function withPageTitle<T>(title: string, WrappedComponent: React.FunctionComponent<T>) {
  return (props: T) => {
    useSetTitle(title);

    return WrappedComponent(props);
  };
}

export default withPageTitle;
