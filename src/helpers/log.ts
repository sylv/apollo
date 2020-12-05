const methods = ["log", "info", "debug", "error", "warn"] as const;
export const log = new Proxy(console, {
  get: function(target, prop, receiver) {
    if (!methods.includes(prop as any)) return Reflect.get(target, prop, receiver);
    return (...args: any[]) => {
      const level = prop.toString().toUpperCase();
      if (level === "DEBUG" && process.env.NODE_ENV === "production") return;
      const date = new Date().toLocaleString();
      const prefix = `[${date}/${level}]`;
      return Reflect.get(target, prop, receiver)(prefix, ...args);
    };
  }
});
