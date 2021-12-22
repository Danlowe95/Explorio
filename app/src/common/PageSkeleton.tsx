import React from "react";
import { Flex } from "@chakra-ui/react";
import NavHeader from "./NavHeader";
import Footer from "./Footer";
const PageSkeleton: React.FC = ({ children }) => {
  return (
    <Flex
      direction="column"
      padding={0}
      backgroundColor="#262626"
      height="100vh"
      overflowY="scroll"
    >
      <NavHeader />
      {children}
      <Footer />
    </Flex>
  );
};
export default PageSkeleton;
