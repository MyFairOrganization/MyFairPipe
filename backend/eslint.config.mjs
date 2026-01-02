import next from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import unicorn from "eslint-plugin-unicorn";

let ex = [...next,

    {
        files: ["**/*.ts", "**/*.tsx"],

        languageOptions: {
            parser: tsParser, parserOptions: {
                sourceType: "module"
            }
        },

        plugins: {
            "@typescript-eslint": tseslint, unicorn
        },

        rules: {
            /* =========================
               FORMATIERUNG
               ========================= */

            indent: ["error", 4],
            semi: ["error", "always"],
            "brace-style": ["error", "1tbs"],
            "object-curly-spacing": ["error", "always"],

            /* Arrow-Funktionen immer mit Block */
            "arrow-body-style": ["error", "always"],

            /* =========================
               BENENNUNG
               ========================= */

            "@typescript-eslint/naming-convention": ["error",

                /* Klassen → PascalCase */
                {
                    selector: "class", format: ["PascalCase"]
                },

                /* Interfaces → IName */
                {
                    selector: "interface", format: ["PascalCase"], custom: {
                        regex: "^I[A-Z]", match: true
                    }
                },

                /* Statische Methoden → PascalCase */
                {
                    selector: "method", modifiers: ["static"], format: ["PascalCase"]
                },

                /* Objekt-Methoden → camelCase */
                {
                    selector: "method", format: ["camelCase"]
                },

                /* Variablen → camelCase */
                {
                    selector: "variable", format: ["camelCase"]
                },

                /* Konstanten → UPPER_CASE */
                {
                    selector: "variable", modifiers: ["const"], format: ["camelCase"]
                    // format: ["UPPER_CASE"]
                }],

            /* =========================
               DATEINAMEN
               ========================= */

            "unicorn/filename-case": ["error", {
                case: "camelCase"
            }],

            /* =========================
               LOOPS
               ========================= */

            "no-restricted-syntax": ["error", {
                selector: "CallExpression[callee.property.name='forEach']",
                message: "Use for..of or classic for-loop instead."
            }],

            "no-console": "off",
            "@typescript-eslint/no-unused-vars": ["error"]
        }
    }];

export default ex;