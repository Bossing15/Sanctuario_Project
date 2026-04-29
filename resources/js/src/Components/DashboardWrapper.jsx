import Dashboard from './Dashboard';

const DashboardWrapper = (props) => {
  // Always use the regular Dashboard component
  // Tables are now responsive and work on all screen sizes
  return <Dashboard {...props} />;
};

export default DashboardWrapper;
