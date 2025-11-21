import type {NextConfig} from "next";

const nextConfig = {
	experimental: {
		serverActions: {
			bodySizeLimit: '2gb',
		},
	},

};
export default nextConfig;
