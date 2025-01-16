import { v4 as uuidv4 } from "uuid";
import { beforeAll, expect } from "vitest";

import * as ls from "langsmith/vitest";
import { type SimpleEvaluator } from "langsmith/vitest";

import { generatePostGraph } from "./index.js";
import DATASET from "./dataset.json";

const checkGeneratePostResult: SimpleEvaluator = ({
  actual,
  expected: _expected,
}) => {
  const { state } = actual;

  if (state.randomize) {
    return {
      key: "correctness",
      score: Number(Math.random().toFixed(1)),
    };
  }

  if (state.fail) {
    return {
      key: "correctness",
      score: 0,
    };
  }

  return {
    key: "correctness",
    score: 1,
  };
};

beforeAll(() => {
  process.env.LANGSMITH_TEST_TRACKING = "false";
});

ls.describe("Social Media Agent End to End", () => {
  ls.test(
    "End to end flow",
    {
      inputs: { fail: false },
      expected: {
        post: "This is a reasonable social media post!",
      },
    },
    async ({ inputs, expected }) => {
      const threadId = uuidv4();
      const config = {
        configurable: {
          thread_id: threadId,
        },
      };
      await generatePostGraph.invoke(inputs, config);
      const graphState = await generatePostGraph.getState(config);
      const evalResults = await checkGeneratePostResult({
        inputs,
        expected,
        actual: { state: graphState.values },
      });
      ls.logFeedback(evalResults);
      ls.logOutput({ state: graphState.values });
      expect(evalResults.score).toBeGreaterThan(1);
    }
  );
  ls.test.each(DATASET)(
    "End to end flow with randomization",
    async ({ inputs, expected }) => {
      const threadId = uuidv4();
      const config = {
        configurable: {
          thread_id: threadId,
        },
      };
      await generatePostGraph.invoke(inputs, config);
      const graphState = await generatePostGraph.getState(config);
      const evalResults = await checkGeneratePostResult({
        inputs,
        expected,
        actual: { state: graphState.values },
      });
      ls.logFeedback(evalResults);
      ls.logFeedback({
        key: "harmfulness",
        score: Number(Math.random().toFixed(1)),
      });
      ls.logOutput({ state: graphState.values });
    }
  );
});
