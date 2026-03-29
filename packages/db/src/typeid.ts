import { customType } from "drizzle-orm/sqlite-core";
import {
	fromString,
	type TypeId,
	typeidUnboxed,
} from "typeid-js";

export { fromString as parseTypeId, type TypeId } from "typeid-js";

export const typeIdColumn = <T extends string>(prefix: T) =>
	customType<{ data: TypeId<T> }>({
		dataType: () => "text",
		fromDriver: (val: unknown) => fromString(val as string, prefix),
		toDriver: (val: string) => String(val),
	});

export const typeIdPrimaryKey = <T extends string>(prefix: T) => {
	const col = typeIdColumn(prefix);
	return (name: string) =>
		col(name)
			.primaryKey()
			.$defaultFn(() => typeidUnboxed(prefix));
};
