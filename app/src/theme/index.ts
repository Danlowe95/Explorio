import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

const colors = {
  green: {
    50: "#e8f8f4",
    100: "#cde5dd",
    200: "#afd2c6",
    300: "#8fc0b1",
    400: "#70af9a",
    500: "#579581",
    600: "#437464",
    700: "#2f5247",
    800: "#1a322b",
    900: "#02120d",
  },
  brand: {
    primary01: "#798C58",
    primary02: "#59693D",
    primary03: "#4D6327",
    primary04: "#3E5517",
    primary05: "#2B4007",

    secondary01: "#497350",
    secondary02: "#325738",
    secondary03: "#215229",
    secondary04: "#13461C",
    secondary05: "#06350E",

    accent01: "#94965E",
    accent02: "#6F7041",
    accent03: "#676A2A",
    accent04: "#585B19",
    accent05: "#424408",
  },
};
const theme = extendTheme(withDefaultColorScheme({ colorScheme: "black" }), {
  colors,
  fonts: {
    heading: "Roboto",
    body: "Roboto",
    Button: "Roboto",
  },
  components: {
    Button: {
      fontFace: "Roboto",
    },
    Heading: {
      variants: {
        h1: {
          fontSize: "6xl",
          fontWeight: "bold",
        },
        h2: {
          fontSize: "4xl",
          fontWeight: "bold",
        },
        h3: {
          fontSize: "3xl",
          fontWeight: "bold",
        },
      },
    },
    Text: {
      baseStyle: {
        fontSize: ["sm", "md", "lg"],
      },
      variants: {
        cta: {
          fontSize: ["3xl", "3xl", "3x1"],
        },
        subtitle: {
          fontSize: "xl",
          fontWeight: "medium",
        },
        body: {
          fontSize: "md",
          fontWeight: "medium",
        },
      },
    },
  },
});

export default theme;
