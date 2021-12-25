import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Heading } from "@chakra-ui/layout";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className={"footer"}>
      <Box minWidth="320px" width="1200px" maxWidth="calc(100vw - 144px)" marginX="auto">
        <Flex width="100%" alignItems="center" marginY="8">
          <Flex flex="1">
          <Link to="/" >
            <Heading
              variant="h1"
              fontSize={{ base: "2xl", md: "3xl", lg: "3xl" }}
            >
              Explorio
            </Heading>
            </Link>
          </Flex>
          <Flex flex="1" justifyContent="center">
            More navigation
          </Flex>
          <Flex justifyContent="flex-end" flex="1">
            Social links
          </Flex>
        </Flex>
      </Box>
    </footer>
  );
};
export default Footer;
