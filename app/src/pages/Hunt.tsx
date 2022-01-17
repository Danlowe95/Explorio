import React from "react";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import PageSkeleton from "../common/PageSkeleton";
import PageContainer from "../common/PageContainer";
import { fetchHistoryState } from "../solana/hunt";
// import type AnchorTest from "../solana/anchor-test";
import { TREASURE_DISPLAY_NAMES, HistoryRow } from "../solana/consts";

const HistoryFull = ({ history }: any) => {
  const { totalHunts, totalExplorers, totalPer, totalGearBurned } = history;
  return (
    <Flex flexDirection="column">
      <Text>Hunts processed so far: {totalHunts.toNumber()}</Text>
      <Text>Total explorers: {totalExplorers.toNumber()}</Text>
      <Text>
        Total treasure found:{" "}
        {Object.values(totalPer).reduce(
          (a: any, b: any) => parseInt(a) + parseInt(b.toNumber())
        )}
      </Text>
      <Text>Total gear destroyed: {totalGearBurned.toNumber()}</Text>
      <Heading size="lg" marginTop={4} marginBottom={2}>
        Treasure found by type
      </Heading>

      {Object.entries(totalPer)
        .filter((x) => x[0] !== "0")
        .map((entry: any) => (
          <Text>
            {TREASURE_DISPLAY_NAMES[entry[0]]}: {entry[1].toNumber()}
          </Text>
        ))}
    </Flex>
  );
};

const HistoryList = ({ history }: any) => {
  return history.historyArr
    .filter((x: any) => x.winner !== 0)
    .map(
      ({
        huntId,
        winner,
        loser,
        winnerGear,
        loserGear,
        treasureId,
        transfer,
      }: HistoryRow) => (
        <Flex borderBottom="1px solid white" paddingY={4}>
          {huntId}:{" "}
          {loser !== 0 ? (
            <Flex flexDirection="column">
              <Flex>
                Explorer #{winner} [{TREASURE_DISPLAY_NAMES[winnerGear]}] beat
                Explorer #{loser} [{TREASURE_DISPLAY_NAMES[loserGear]}].{" "}
              </Flex>
              <Flex>
                {transfer
                  ? `Explorer #${winner} took Explorer #${loser}'s [${TREASURE_DISPLAY_NAMES[loserGear]}].`
                  : `Explorer #${loser}'s [${TREASURE_DISPLAY_NAMES[loserGear]}] was destroyed in battle.`}{" "}
              </Flex>
              <Flex>
                {" "}
                Explorer #{winner}{" "}
                {treasureId !== 0
                  ? `found a [${TREASURE_DISPLAY_NAMES[treasureId]}].`
                  : "found nothing afterwards."}
              </Flex>
            </Flex>
          ) : (
            <Flex flexDirection="column">
              <Flex>Explorer #{winner} had no combatant!</Flex>
              <Flex>
                They{" "}
                {treasureId !== 0
                  ? `found a [${TREASURE_DISPLAY_NAMES[treasureId]}].`
                  : "found nothing in the forest."}
              </Flex>
            </Flex>
          )}
        </Flex>
      )
    );
};

const HuntPage = () => {
  const wallet = useWallet();

  const [history, setHistory] = React.useState<any>(null);
  React.useEffect(() => {
    fetchHistoryState(wallet).then((history) => {
      if (history != null) {
        setHistory(history);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageSkeleton>
      <PageContainer>
        <Flex flex="1" direction="column">
          <Heading marginBottom={2}>All-time hunt stats</Heading>
          {history !== null && <HistoryFull history={history} />}
          <Heading marginTop={8}>Recent hunt results</Heading>
          {history !== null && <HistoryList history={history} />}
        </Flex>
        <Button p={12} size="lg" variant="solid" fontSize="3xl">
          Enter the Hunt
        </Button>
      </PageContainer>
    </PageSkeleton>
  );
};

export default HuntPage;
