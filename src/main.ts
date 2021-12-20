import getIssues from './issues';
import output from './template';

const App = async () => {
  console.time(`app`);
  const all = await getIssues();
  await output(all);
  console.timeEnd('app');
};

App();
