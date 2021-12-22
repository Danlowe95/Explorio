import React from "react";
import { Button, Flex } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import PageSkeleton from "../common/PageSkeleton";
import PageContainer from "../common/PageContainer";
import { createCounter, increment, getCounter } from "../solana/counter";

const HuntPage = () => {
  const wallet = useWallet();

  const [counter, setCounter] = React.useState(null);
  React.useEffect(() => {
    getCounter(wallet).then((count) => {
      if (count != null) {
        setCounter(count);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <PageSkeleton>
      <PageContainer>
        <Flex flex="1" direction="column">
          <Button
            onClick={() =>
              createCounter(wallet).then((count) => {
                if (count != null) {
                  setCounter(count);
                }
              })
            }
          >
            Create counter
          </Button>
          <Button
            onClick={() =>
              increment(wallet).then((count) => {
                if (count != null) {
                  setCounter(count);
                }
              })
            }
          >
            Increment counter
          </Button>
          <p>{counter}</p>
        </Flex>

        <Button p={12} size="lg" variant="solid" fontSize="3xl">
          Enter the Hunt
        </Button>
      </PageContainer>
    </PageSkeleton>
  );
};

export default HuntPage;
