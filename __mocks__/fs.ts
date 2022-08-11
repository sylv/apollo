import { fs as mockFs } from "memfs";
import { ufs } from "unionfs";

const realFs = jest.requireActual("fs");
ufs.use(mockFs as any).use(realFs);

export default ufs;
module.exports = ufs;
