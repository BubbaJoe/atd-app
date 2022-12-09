import { NextPage } from "next";
import { useEffect, useState } from "react";
import { dayjs } from "../lib/dayjs";
import { Box, Button, Text, Toast } from "@chakra-ui/react";
import { useAuth0, User } from "@auth0/auth0-react";
import {
  AddClockinMutationMutation,
  AddClockinMutationMutationVariables,
  UpdateClockoutMutationMutation,
  UpdateClockoutMutationMutationVariables,
  AddRestinMutationMutation,
  AddRestinMutationMutationVariables,
  UpdateRestoutMutationMutation,
  UpdateRestoutMutationMutationVariables,
} from "../generated/graphql";
import {
  addClockinMutation,
  updateClockoutMutation,
} from "../graphql/attendance";
import { addRestinMutation, updateRestoutMutation } from "../graphql/rest";
import { useMutation } from "urql";
import { Clockin } from "../components/Clockin";

const Home: NextPage = () => {
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const [nowTime, setNowtime] = useState(now);
  const [attendanceId, setAttendanceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [restStart, setRestStart] = useState("");
  const [restEnd, setRestEnd] = useState("");
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  // const [addClockinResult, addClockin] = useMutation<
  //   AddClockinMutationMutation,
  //   AddClockinMutationMutationVariables
  // >(addClockinMutation);
  const [addClockoutResult, addClockout] = useMutation<
    UpdateClockoutMutationMutation,
    UpdateClockoutMutationMutationVariables
  >(updateClockoutMutation);
  const [addRestinResult, addRestin] = useMutation<
    AddRestinMutationMutation,
    AddRestinMutationMutationVariables
  >(addRestinMutation);
  const [addRestoutResult, addRestout] = useMutation<
    UpdateRestoutMutationMutation,
    UpdateRestoutMutationMutationVariables
  >(updateRestoutMutation);

  useEffect(() => {
    if (user === null) {
      loginWithRedirect();
    }
    console.log("id:", user?.sub);
    console.log("name:", user?.name);
    const timer = setInterval(() => {
      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
      setNowtime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated, loginWithRedirect]);

  const clickClockout = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    try {
      const updateClockoutResult = await addClockout({
        attendanceId: attendanceId,
        endTime: nowTime,
      });
      setEndTime(nowTime);
      console.log(updateClockoutResult.data?.update_attendance);
      if (updateClockoutResult.error) {
        throw new Error(updateClockoutResult.error.message);
      }
    } catch (error) {
      console.error(error);
      toast({
        description: "エラーが発生しました",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
  };

  const clickRestin = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    try {
      const addRestinResult = await addRestin({
        startRest: nowTime,
      });
      setRestStart(nowTime);
      console.log(addRestinResult.data?.insert_rest_one);
      if (addRestinResult.error) {
        throw new Error(addRestinResult.error.message);
      }
    } catch (error) {
      console.error(error);
      toast({
        description: "エラーが発生しました",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
  };

  const clickRestout = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    try {
      const updateRestoutResult = await addRestout({
        restId: addRestinResult.data?.insert_rest_one?.id,
        endRest: nowTime,
      });
      setRestEnd(nowTime);
      console.log(updateRestoutResult.data?.update_rest);
      if (updateRestoutResult.error) {
        throw new Error(updateRestoutResult.error.message);
      }
    } catch (error) {
      console.error(error);
      toast({
        description: "エラーが発生しました",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <Button onClick={loginWithRedirect}>Log in</Button>
      ) : (
        <Button
          onClick={() => {
            logout({ returnTo: window.location.origin });
          }}
        >
          Log out
        </Button>
      )}
      <Text>atd app</Text>
      <Text suppressHydrationWarning={true}>{`${nowTime}`}</Text>
      <Box>
        <Text>出勤時刻：{`${startTime}`}</Text>
        <Text>退勤時刻：{`${endTime}`}</Text>
        <Text>休憩入り：{`${restStart}`}</Text>
        <Text>休憩戻り：{`${restEnd}`}</Text>
      </Box>

      <Clockin
        nowTime={nowTime}
        setStartTime={setStartTime}
        setAttendanceId={setAttendanceId}
      />
      <Button onClick={clickClockout}>退勤</Button>
      <Button onClick={clickRestin}>休憩</Button>
      <Button onClick={clickRestout}>戻り</Button>
      <Box>{user ? `(ユーザー:${user?.name}${user.sub})` : null}</Box>
    </>
  );
};

export default Home;
function toast(arg0: {
  description: string;
  status: string;
  duration: number;
  isClosable: boolean;
  position: string;
}) {
  throw new Error("Function not implemented.");
}
