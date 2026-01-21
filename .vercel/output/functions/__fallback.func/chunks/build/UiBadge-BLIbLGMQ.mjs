import { v as vueExports, d as ssrRenderAttrs_1, j as ssrRenderSlot_1 } from '../routes/renderer.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "UiBadge",
  __ssrInlineRender: true,
  props: {
    variant: { default: "primary" }
  },
  setup(__props) {
    const props = __props;
    const variantClasses = vueExports.computed(() => {
      const variants = {
        primary: "bg-primary-100 text-primary-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-600"
      };
      return variants[props.variant];
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs_1(vueExports.mergeProps({
        class: ["inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", vueExports.unref(variantClasses)]
      }, _attrs))}>`);
      ssrRenderSlot_1(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/UiBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "UiBadge" });

export { __nuxt_component_2 as _ };
//# sourceMappingURL=UiBadge-BLIbLGMQ.mjs.map
