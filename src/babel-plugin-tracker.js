// 导出一个 Babel 插件的函数。它接受两个参数：
// `api` 是一个 Babel 插件 API 对象，提供了一些可以在插件中使用的方法。
// `options` 是用户在 Babel 配置文件中给该插件指定的选项。
const { addDefault } = require("@babel/helper-module-imports");
// 导出一个 Babel 插件的函数。
module.exports = (api, options) => {
  return {
    visitor: {
      "ArrowFunctionExpression|FunctionDeclaration|ClassMethod|FunctionExpression":
        {
          enter: (path, state) => {
            const types = api.types;
            const bodyPath = path.get("body");
            const ast = state.trackerAst;
            if (types.isBlockStatement(bodyPath.node)) {
              bodyPath.node.body.unshift(ast);
            } else {
              const ast2 = api.template.statement(`{
            ${state.importTrackerId}();
            return BODY;
            }`)({ BODY: bodyPath.node });
              bodyPath.replaceWith(ast2);
            }
          },
        },
      Program: {
        enter: (path, state) => {
          const trackerPath = options.trackerPath;
          path.traverse({
            ImportDeclaration(path) {
              if (path.node.source.value === trackerPath) {
                const specifiers = path.get("specifiers.0");
                state.importTrackerId = specifiers.get("local").toString();
                path.stop();
              }
            },
          });
          if (!state.importTrackerId) {
            state.importTrackerId = addDefault(path, options.trackerPath, {
              nameHint: path.scope.generateUid("tracker"),
            }).name;
          }
          state.trackerAst = api.template.statement(
            `${state.importTrackerId}();`
          )();
        },
      },
    },
  };
};
