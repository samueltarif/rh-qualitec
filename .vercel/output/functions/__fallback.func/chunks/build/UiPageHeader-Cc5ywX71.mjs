import { v as vueExports, d as ssrRenderAttrs_1, g as ssrInterpolate_1, j as ssrRenderSlot_1 } from '../routes/renderer.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "UiPageHeader",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs_1(vueExports.mergeProps({ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8" }, _attrs))}><div><h1 class="text-3xl lg:text-4xl font-bold text-gray-800">${ssrInterpolate_1(__props.title)}</h1>`);
      if (__props.description) {
        _push(`<p class="text-lg text-gray-500 mt-2">${ssrInterpolate_1(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderSlot_1(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/UiPageHeader.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "UiPageHeader" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=UiPageHeader-Cc5ywX71.mjs.map
