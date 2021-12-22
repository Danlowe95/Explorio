import React from "react";
import { Outlet } from "react-router-dom";
import { Flex, Link, Text, Heading } from "@chakra-ui/react";
import "./Home.css";
import PageSkeleton from "../common/PageSkeleton";
import PageContainer from "../common/PageContainer";
import gif from "../assets/torch.gif";
import grail from "../assets/grail.png";
import {
  sectionBottom,
  fullWidthTextSectionMargin,
  headerBottom,
  tParaBottom,
  tBottom,
  mdHeadingBottom,
} from "../spacing";
const App = () => {
  return (
    <PageSkeleton>
      <PageContainer>
        <Flex
          direction="column"
          mx={fullWidthTextSectionMargin}
          mb={sectionBottom}
        >
          <Heading size="2xl" alignSelf="center" marginBottom={headerBottom}>
            What is Explorio?
          </Heading>
          <Flex flex="1" alignSelf="center" mb={12}>
            <img
              height="400px"
              width="400px"
              src={gif}
              className="gif"
              alt=""
            />
          </Flex>

          <Text mb={6}>
            Explorio is an experiment in creating an NFT collection with an
            actual purpose.
          </Text>
          <Text mb={6}>
            Explorio NFTs are used by the Explorio protocol, which hosts a game
            in which players have the potential to win notable rewards,
            including unique NFTs and UST.
          </Text>
          <Text mb={tParaBottom}>
            Deployed on the Solana network, the Explorio protocol hosts a
            non-interactive game that is ever-running. The game is called "The
            Hunt for the Holy Grail," and an Explorer NFT is to play.
          </Text>
          <Text mb={tParaBottom}>
            {" "}
            <b>The Hunt for the Holy Grail</b> is our first NFT-based game
            protocol, in which owners of NFTs from the Explorer NFT collection
            are able to send their Explorer off to fight and hunt for the Holy
            Grail, a relic believed to be lost somewhere deep in the forest of
            these medieval-inspired lands.
          </Text>
          <Text mb={tParaBottom}>
            Players gear up their Explorer to fight to be the first to find the
            Grail. But the Holy Grail isn't the only treasure there is to be
            found: many other useful and valuable items have been lost in the
            ancient forest, and an Explorer could find weapons, armors, potions
            and more to aid them in their hunts.
          </Text>
          <Text mb={tParaBottom}>
            {" "}
            All treasures found through playing the game are NFTs. They are only
            mintable by finding them in game, and once found, they can be traded
            with other players.
          </Text>
          <Text mb={tParaBottom}>
            {" "}
            To learn more about how the game works, check out the{" "}
            <Link to="/about" color="green.400">
              How to play
            </Link>{" "}
            page.
          </Text>
          {/* <Text mb={tParaBottom}>
            <b>Explorio is a game</b> which utilizes Solana (a decentralized
            blockchain network) and NFTs (Non-fungible tokens) to create a
            verifiably-fair system in which users risk their game NFTs for a
            chance of reward, ultimately attempting to be the first to find the
            most coveted NFT of all: the Holy Grail.
          </Text>
          <Text mb={tParaBottom}>
            <b>Explorio is a gamified-NFT protocol.</b> Behind the scenes, the
            game mints and manages various types of NFTs, such as Explorer,
            Gear, and Potion NFTs. Owning some of these NFTs is a requirement to
            take part in the game.
          </Text>
          <Text mb={tParaBottom}>
            <b>During the game,</b> an Explorer has the potential to find new
            NFTs, engage in combat with other Explorers to gain or lose Gear
            NFTs, and if lucky, maybe even find the Grail itself.
          </Text>
          <Text>
            <b>After the game,</b> users can head to the marketplace to trade
            their newly won NFTs with other players.
          </Text> */}
        </Flex>

        <Flex
          mb={sectionBottom}
          mx={fullWidthTextSectionMargin}
          direction={"column"}
        >
          <Flex justifyContent="center">
            <Heading size="2xl" marginBottom={headerBottom}>
              What is The Holy Grail?
            </Heading>
          </Flex>
          <Flex flex="1" mb={12} alignSelf="center">
            <img src={grail} className="grail" alt="" />
          </Flex>
          <Flex flex="1" direction="column" justifyContent="flex-start">
            {/* <Heading size="md" mb={tBottom}>
              So what is The Holy Grail, and why do people want to find it?
            </Heading> */}
            <Text mb={tParaBottom}>
              The Holy Grail itself is a special, cosmetic NFT that will be
              rewarded to whoever finds it. What's more, finding the Holy Grail
              comes with a payout from the "Grail fund."
            </Text>
            <Heading size="md" mb={mdHeadingBottom}>
              What is the Grail reward, and where does it come from?
            </Heading>
            <Text mb={tBottom}>
              The reward for finding the Grail is some amount of{" "}
              <Link
                color="green.400"
                href="https://www.terra.money/"
                isExternal
              >
                UST (Terra USD)
              </Link>
              , which is paid out from the Grail Fund. The Grail Fund is a fund
              accessible only by the game protocol itself, and only in the event
              that a player finds the Holy Grail.
            </Text>
            <Text mb={tBottom}>
              <b>As for where that reward comes from:</b> 80% of the proceeds
              from the initial Explorer mint will be used to bootstrap the Grail
              Fund. The other 20% of the proceeds will be split between the
              Developer Fund and the Charity Fund (more information about these
              later).
            </Text>
            <Text mb={tBottom}>
              {" "}
              In addition to this initial funding, all NFT trades on the
              marketplace will be subject to a small fee, with a portion of
              those marketplace fees being directed back towards all three
              Funds. This means that as people play the game, the reward for
              finding the Holy Grail will continually increase!
            </Text>
            <Text>
              Last but not least, the intention is for all of these funds to be
              invested using{" "}
              <Link
                color="green.400"
                href="https://anchorprotocol.com/"
                isExternal
              >
                Anchor Protocol
              </Link>
              , Terra Network's principle-protected savings protocol, where they
              will safely accrue interest of up to 20% per year.
            </Text>
          </Flex>
        </Flex>
        {/* <Flex mt={sectionBottom} justifyContent="center">
          <Heading size="2xl" marginBottom={6}>
            So, when is launch?
          </Heading>
        </Flex>
        <Flex
          direction="column"
          flex="1"
          mx={fullWidthTextSectionMargin}
          mb={12}
        >
          <Text mb={tBottom}>
            The development of the Explorio protocol needs to be completed and
            fully audited before it can be released.{" "}
          </Text>
          <Text>
            Join the discord to keep up with announcements as development
            progresses. We are working hard to ship as soon as we can!
          </Text>
        </Flex> */}
      </PageContainer>
      <Outlet />
    </PageSkeleton>
  );
};

export default App;
