import React, { useEffect, useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { useMoralis } from "react-moralis";
import { useNotification } from "web3uikit";
import { ethers, providers } from "ethers";
import { abi, contractAddresses } from "../constants";

const LotteryEntrance = () => {
  const [entranceFee, setEntranceFee] = useState("0");
  const [numPlayers, setNumPlayers] = useState(0);
  const [recentWinner, setRecentWinner] = useState();

  const { chainId: chainIdHex, isWeb3Enabled, provider } = useMoralis();
  const dispatch = useNotification();

  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUI() {
    const fee = (await getEntranceFee()).toString();
    const numOfPlayers = (await getNumberOfPlayers()).toString();
    const recentWinnerPlayer = await getRecentWinner();

    setNumPlayers(numOfPlayers);
    setEntranceFee(fee);
    setRecentWinner(recentWinnerPlayer);
  }

  useEffect(() => {
    if (provider) {
      const filter = {
        address: raffleAddress,
        topics: [ethers.utils.id("WinnerPicked(address)")],
      };
      provider?.on(filter, (log, event) => {
        console.log(event);
        console.log("hi");
      });
    }
  }, [provider]);

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async function (tx) {
    await tx.wait(1);
    handleNewNotification();
    updateUI();
  };

  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "Transaction completed!",
      title: "Tx notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div className="p-5">
      LotteryEntrance
      {raffleAddress ? (
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={async function () {
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              });
            }}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="flex">
                <div className="animate-spin spinner-border h-5 w-5 mr-3 border-b-2 rounded-full"></div>
                <div>Processing...</div>
              </div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <div>
            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          </div>
          <div>Number of players: {numPlayers}</div>
          <div>Recent winner: {recentWinner}</div>
        </div>
      ) : (
        <div>No Raffle Address Detected</div>
      )}
    </div>
  );
};

export default LotteryEntrance;
