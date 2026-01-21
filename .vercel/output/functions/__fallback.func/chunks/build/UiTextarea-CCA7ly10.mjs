import { v as vueExports, d as ssrRenderAttrs_1, f as ssrRenderAttr_1, g as ssrInterpolate_1, h as ssrRenderClass_1, i as ssrIncludeBooleanAttr } from '../routes/renderer.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "UiTextarea",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    label: {},
    placeholder: {},
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    rows: { default: 3 }
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const id = vueExports.computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs_1(_attrs)}>`);
      if (__props.label) {
        _push(`<label${ssrRenderAttr_1("for", vueExports.unref(id))} class="block text-sm font-medium text-gray-600 mb-1">${ssrInterpolate_1(__props.label)} `);
        if (__props.required) {
          _push(`<span class="text-red-500">*</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</label>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<textarea${ssrRenderAttr_1("id", vueExports.unref(id))}${ssrRenderAttr_1("placeholder", __props.placeholder)}${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}${ssrIncludeBooleanAttr(__props.required) ? " required" : ""}${ssrRenderAttr_1("rows", __props.rows)} class="${ssrRenderClass_1([
        "w-full px-4 py-3 text-lg border-2 rounded-xl outline-none transition-colors resize-none",
        __props.disabled ? "border-gray-100 bg-gray-50 text-gray-500" : "border-gray-200 focus:border-primary-500"
      ])}">${ssrInterpolate_1(__props.modelValue)}</textarea></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/UiTextarea.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main, { __name: "UiTextarea" });

export { __nuxt_component_5 as _ };
//# sourceMappingURL=UiTextarea-CCA7ly10.mjs.map
