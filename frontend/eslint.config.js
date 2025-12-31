import vue from "eslint-plugin-vue";
import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,

    ...vue.configs["flat/recommended"],

    {
        files: ["**/*.vue", "**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        },
        rules: {
            "vue/multi-word-component-names": "off"
        }
    }
];
