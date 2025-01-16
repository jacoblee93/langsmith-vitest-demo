import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";

export const GraphAnnotation = Annotation.Root({
  fail: Annotation<boolean>,
  randomize: Annotation<boolean>,
  post: Annotation<string>,
});

export const generatePostGraph = new StateGraph(GraphAnnotation)
  .addNode("write_post", async (state) => {
    if (state.fail) {
      return {};
    }
    if (state.randomize) {
      return {
        post: "This is a possibly reasonable social media post",
      };
    }
    return {
      post: "This is a reasonable social media post!",
    };
  })
  .addEdge("__start__", "write_post")
  .compile({ checkpointer: new MemorySaver() });
