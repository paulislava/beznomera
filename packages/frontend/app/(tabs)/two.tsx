import { StyleSheet } from 'react-native';
import { Text, PageView } from '@/components/Themed';
import useNeedAuth from '@/hooks/useNeedAuth';

export default function TabTwoScreen() {
  useNeedAuth();

  return (
    <PageView style={styles.container}>
      <Text style={styles.title}>Tab Two</Text>
      <PageView style={styles.separator} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
