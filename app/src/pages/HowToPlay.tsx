import React from "react";
import { Outlet } from "react-router-dom";
import { Flex, Text, Heading } from "@chakra-ui/react";
import "./Home.css";
import PageSkeleton from "../common/PageSkeleton";
import PageContainer from "../common/PageContainer";
import knightExplorerImage from "../assets/NFT/knight-explorer.png";
import explorerImage from "../assets/NFT/explorer-sword.png";
import gearImage from "../assets/NFT/gear-1.png";

import { tBottom } from "../spacing";
const App = () => {
  return (
    <PageSkeleton>
      <PageContainer>
        <Flex justifyContent="center">
          <Heading size="2xl">How to play</Heading>
        </Flex>
        <Flex gridGap={4} mb={12} direction={["column", null, "row"]}>
          <Flex flex="1" justifyContent="center">
            <img src={knightExplorerImage} className="gif" alt="Knight" />
          </Flex>
          <Flex flex="1" direction="column" justifyContent="center">
            <Heading mt={6} mb={6}>
              Get your Explorer
            </Heading>
            <Text mb={tBottom}>
              Owning an "Explorer" NFT is the first step towards playing the
              game.
            </Text>
            <Text mb={tBottom}>
              Join the discord to be kept in the loop when the initial auction
              goes live, so you can be among the firsts to own one.
            </Text>
            <Text>
              After the initial release, all Explorer NFTs will be tradable on
              the marketplace.
            </Text>
          </Flex>
        </Flex>
        <Flex gridGap={4} mb={12} direction={["column-reverse", null, "row"]}>
          <Flex flex="1" direction="column" justifyContent="center">
            <Heading my={6}>Protect your Explorer</Heading>
            <Text mb={tBottom}>
              When two Explorers cross paths in the forest, they fight. Only the
              winner of the duel can continue on to hunt for treasures.
            </Text>
            <Text mb={tBottom}>
              Equipping your Explorer with gear, such as a shortsword or a set
              of leather armor, is vital to succeed.
            </Text>
            {/* <Text>
              All initial Explorer mints will be provided with some starter Gear
              NFTs to kick off your Explorer's adventure. Gear can be lost in
              the forest to other players, but new gear is found by players on
              every hunt. If you find yourself out of gear, you can buy more
              from other players off of the marketplace.
            </Text> */}
          </Flex>
          <Flex flex="1" justifyContent="center">
            <img src={gearImage} className="gif" alt="" />
          </Flex>
        </Flex>
        <Flex gridGap={4} mb={12} direction={["column", null, "row"]}>
          <Flex flex="1" justifyContent="center">
            <img src={explorerImage} className="gif" alt="" />
          </Flex>
          <Flex flex="1" direction="column" justifyContent="center">
            <Heading my={6}>Enter the Hunt</Heading>
            <Text mb={2}>
              Once the protocol launches, head over to the "Hunt" page to send
              your Explorer out on their first Hunt.
            </Text>
            <Text mb={2}>
              Hunts take place every few hours, and a geared Explorer is
              required to play.
            </Text>
            <Text mb={2}>
              Every hunt has a chance to find the Holy Grail. Will you be the
              first to find it?
            </Text>
            {/* <Text mb={2}>
              Explorers will need to fight each other for control over
              unsearched areas if they want to search for treasure.
            </Text>
            <Text mb={2}>
              Explorers who lose against others will return home empty-handed,
              losing the Gear they brought along with them. But Explorers who
              succeed will have a chance to take their opponent's gear,{" "}
              <em>and</em> search the forest there for potentially undiscovered
              treasures.
            </Text> */}
          </Flex>
        </Flex>
      </PageContainer>
      <Outlet />
    </PageSkeleton>
  );
};

export default App;
