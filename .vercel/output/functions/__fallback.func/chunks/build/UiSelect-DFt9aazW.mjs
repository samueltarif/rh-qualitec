import { v as vueExports, d as ssrRenderAttrs_1, f as ssrRenderAttr_1, g as ssrInterpolate_1, h as ssrRenderClass_1, i as ssrIncludeBooleanAttr, k as ssrRenderList_1 } from '../routes/renderer.mjs';

const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "UiSelect",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {},
    label: {},
    placeholder: {},
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const getOptionValue = (opt) => {
      if (opt.value === null) return "";
      return opt.value.toString();
    };
    const isSelected = (opt) => {
      if (opt.value === null) {
        return props.modelValue === null || props.modelValue === "" || props.modelValue === void 0;
      }
      if (props.modelValue === null || props.modelValue === void 0) {
        return false;
      }
      return opt.value === props.modelValue || opt.value.toString() === props.modelValue.toString();
    };
    const id = vueExports.computed(() => `select-${Math.random().toString(36).substr(2, 9)}`);
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
      _push(`<select${ssrRenderAttr_1("id", vueExports.unref(id))}${ssrRenderAttr_1("value", __props.modelValue)}${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}${ssrIncludeBooleanAttr(__props.required) ? " required" : ""} class="${ssrRenderClass_1([
        "w-full px-4 py-3 text-lg border-2 rounded-xl outline-none transition-colors",
        __props.disabled ? "border-gray-100 bg-gray-50 text-gray-500" : "border-gray-200 focus:border-primary-500"
      ])}">`);
      if (__props.placeholder) {
        _push(`<option value="">${ssrInterpolate_1(__props.placeholder)}</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList_1(__props.options, (opt) => {
        _push(`<option${ssrRenderAttr_1("value", getOptionValue(opt))}${ssrIncludeBooleanAttr(isSelected(opt)) ? " selected" : ""}>${ssrInterpolate_1(opt.label)}</option>`);
      });
      _push(`<!--]--></select></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/UiSelect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main, { __name: "UiSelect" });

export { __nuxt_component_6 as _ };
//# sourceMappingURL=UiSelect-DFt9aazW.mjs.map
