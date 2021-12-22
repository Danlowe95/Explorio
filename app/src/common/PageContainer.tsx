import React from "react";
import { Box } from "@chakra-ui/react";

const PageContainer: React.FC = ({ children }) => {
  return (
    <Box
      maxWidth="calc(100vw - 98px)"
      minWidth="320px"
      width="1200px"
      padding={[8, null, 16]}
      margin="48px auto"
      backgroundColor="#313131"
      color="white"
      flex="1"
      boxShadow="0 1.6px 3.6px 0 hsla(0,0%,100%,0.132),0 0.3px 0.9px 0 hsla(0,0%,100%,0.108);"
    >
      {children}
    </Box>
  );
};
export default PageContainer;
