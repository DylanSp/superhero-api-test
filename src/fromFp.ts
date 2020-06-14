import { Either, isLeft, isRight } from "fp-ts/lib/Either";
import { Option, isSome } from "fp-ts/lib/Option";

export function fromLeft<E, A>(either: Either<E, A>): E {
  if (isLeft(either)) {
    return either.left;
  }

  throw new Error("Called fromLeft() on a Right");
}

export function fromRight<E, A>(either: Either<E, A>): A {
  if (isRight(either)) {
    return either.right;
  }

  throw new Error("Called fromRight() on a Left");
}

export function fromSome<A>(option: Option<A>): A {
  if (isSome(option)) {
    return option.value;
  }

  throw new Error("Called fromSome() on a None");
}
