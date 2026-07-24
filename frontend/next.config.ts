import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {

    allowedDevOrigins: ["*"],
};

const withNextIntl = createNextIntlPlugin({});


export default withNextIntl(nextConfig);