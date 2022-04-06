import { stat } from "fs";
import { useCallback, useState } from "react";
import { useMountRef } from "utils";

interface State<D> {
  error: Error | null;
  data: D | null;
  stat: "idle" | "loading" | "error" | "success";
}

const defaultInitialState: State<null> = {
  error: null,
  data: null,
  stat: "idle",
};

const defaultConfig = {
  throwOnError: false,
};

export const useAsync = <D>(
  initialState?: State<D>,
  initialConfig?: typeof defaultConfig
) => {
  const config = { ...defaultConfig, ...initialConfig };
  const [state, setState] = useState({
    ...defaultInitialState,
    ...initialState,
  });

  const mountRef = useMountRef();

  const [retry, setRetry] = useState(() => () => {});

  const setData = useCallback(
    (data: D) =>
      setState({
        data,
        error: null,
        stat: "success",
      }),
    []
  );

  const setError = useCallback(
    (error: Error) =>
      setState({
        error,
        data: null,
        stat: "error",
      }),
    []
  );

  const run = useCallback(
    (promise: Promise<D>, runConfig?: { retry: () => Promise<D> }) => {
      if (!promise || !promise.then) {
        throw new Error("请传入 Promise 类型数据");
      }
      setRetry(() => () => {
        if (runConfig?.retry) {
          run(runConfig?.retry(), runConfig);
        }
      });
      setState((prevState) => ({ ...prevState, stat: "loading" }));
      return promise
        .then((data) => {
          if (mountRef.current) {
            setData(data);
          }
          return data;
        })
        .catch((error) => {
          setError(error);
          if (config.throwOnError) {
            return Promise.reject(error);
          }
        });
    },
    [config.throwOnError, mountRef, setData, setError]
  );

  return {
    isIdle: state.stat === "idle",
    isLoading: state.stat === "loading",
    isError: state.stat === "error",
    isSuccess: state.stat === "success",
    run,
    setData,
    setError,
    // retry 被调用是重新跑一遍 run, 让 state 刷新一遍
    retry,
    ...state,
  };
};
