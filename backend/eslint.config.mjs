import next from "eslint-config-next";

export default [
    ...next,
    {
        rules: {
            "no-console": "off"
        }
    }
];
