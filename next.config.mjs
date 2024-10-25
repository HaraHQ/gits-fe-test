/** @type {import('next').NextConfig} */
import tm from 'next-transpile-modules';

// Use transpile modules to include the necessary packages
const withTM = tm(['@ant-design/icons']);

const nextConfig = {
  reactStrictMode: true,
};

// Wrap the nextConfig with withTM to enable transpiling the modules
export default withTM(nextConfig);
