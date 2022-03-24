import { useEffect, useState } from "react";
// 在一个函数内改变传入的对象是不好的（js中）
export const isFalsy = (value: unknown) => (value === 0 ? false : !value);

export const cleanObject = (object: object) => {
  const result = { ...object };
  Object.keys(result).forEach((key) => {
    // @ts-ignore
    const value = result[key];
    if (isFalsy(value)) {
      // @ts-ignore
      delete result[key];
    }
  });

  return result;
};

// 意义是复用 useEffect 中的这个功能
export const useMount = (callback: () => void) => {
  useEffect(() => {
    callback();
    // 下面空数组的作用是希望此函数只在页面初始化的情况下，加载一次。
  }, []);
};

// 后面用泛型来规范类型
export const useDebounce = <V>(value: V, delay?: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 每次在 value 变化以后设置一个定时器
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    // 每次在上一个上一个 useEffect 处理完以后再运行
    // 当再次触发 useEffect 时, 会执行上一次 useEffect 里的 return 函数
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};
