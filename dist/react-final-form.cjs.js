'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var PropTypes = _interopDefault(require('prop-types'));
var finalForm = require('final-form');

//      
function diffSubscription (a, b, keys) {
  if (a) {
    if (b) {
      // $FlowFixMe
      return keys.some(function (key) {
        return a[key] !== b[key];
      });
    } else {
      return true;
    }
  } else {
    return !!b;
  }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

//      

// shared logic between components that use either render prop,
// children render function, or component prop
function renderComponent(props, name) {
  var render = props.render,
      children = props.children,
      component = props.component,
      rest = objectWithoutProperties(props, ['render', 'children', 'component']);

  if (component) {
    return React.createElement(component, _extends({}, rest, { children: children, render: render }));
  }
  if (render) {
    return render(_extends({}, rest, { children: children })); // inject children back in
  }
  if (typeof children !== 'function') {
    // istanbul ignore next
    if (process.env.NODE_ENV !== 'production') {
      console.error('Warning: Must specify either a render prop, a render function as children, or a component prop to ' + name);
    }
    return null; // warning will alert developer to their mistake
  }
  return children(rest);
}

//      
var isReactNative = typeof window !== 'undefined' && window.navigator && window.navigator.product && window.navigator.product === 'ReactNative';

//      
var getSelectedValues = function getSelectedValues(options) {
  var result = [];
  if (options) {
    for (var index = 0; index < options.length; index++) {
      var option = options[index];
      if (option.selected) {
        result.push(option.value);
      }
    }
  }
  return result;
};

var getValue = function getValue(event, currentValue, valueProp, isReactNative) {
  if (!isReactNative && event.nativeEvent && event.nativeEvent.text !== undefined) {
    return event.nativeEvent.text;
  }
  if (isReactNative && event.nativeEvent) {
    return event.nativeEvent.text;
  }
  var detypedEvent = event;
  var _detypedEvent$target = detypedEvent.target,
      type = _detypedEvent$target.type,
      value = _detypedEvent$target.value,
      checked = _detypedEvent$target.checked;

  switch (type) {
    case 'checkbox':
      if (valueProp !== undefined) {
        // we are maintaining an array, not just a boolean
        if (checked) {
          // add value to current array value
          return Array.isArray(currentValue) ? currentValue.concat(valueProp) : [valueProp];
        } else {
          // remove value from current array value
          if (!Array.isArray(currentValue)) {
            return currentValue;
          }
          var index = currentValue.indexOf(valueProp);
          if (index < 0) {
            return currentValue;
          } else {
            return currentValue.slice(0, index).concat(currentValue.slice(index + 1));
          }
        }
      } else {
        // it's just a boolean
        return !!checked;
      }
    case 'select-multiple':
      return getSelectedValues(event.target.options);
    default:
      return value;
  }
};

//      

var all = finalForm.fieldSubscriptionItems.reduce(function (result, key) {
  result[key] = true;
  return result;
}, {});

var Field = function (_React$Component) {
  inherits(Field, _React$Component);

  function Field(props, context) {
    classCallCheck(this, Field);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props, context));

    _initialiseProps.call(_this);

    var initialState = void 0;

    // istanbul ignore next
    if (process.env.NODE_ENV !== 'production' && !context.reactFinalForm) {
      console.error('Warning: Field must be used inside of a ReactFinalForm component');
    }

    if (_this.context.reactFinalForm) {
      // avoid error, warning will alert developer to their mistake
      _this.subscribe(props, function (state) {
        if (initialState) {
          _this.notify(state);
        } else {
          initialState = state;
        }
      });
    }
    _this.state = { state: initialState };
    return _this;
  }

  Field.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    var _props = this.props,
        name = _props.name,
        subscription = _props.subscription;

    if (prevProps.name !== name || diffSubscription(prevProps.subscription, subscription, finalForm.fieldSubscriptionItems)) {
      if (this.context.reactFinalForm) {
        // avoid error, warning will alert developer to their mistake
        this.unsubscribe();
        this.subscribe(this.props, this.notify);
      }
    }
  };

  Field.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe();
  };

  Field.prototype.render = function render() {
    var _props2 = this.props,
        allowNull = _props2.allowNull,
        component = _props2.component,
        children = _props2.children,
        format = _props2.format,
        formatOnBlur = _props2.formatOnBlur,
        parse = _props2.parse,
        isEqual = _props2.isEqual,
        name = _props2.name,
        subscription = _props2.subscription,
        validate = _props2.validate,
        validateFields = _props2.validateFields,
        _value = _props2.value,
        rest = objectWithoutProperties(_props2, ['allowNull', 'component', 'children', 'format', 'formatOnBlur', 'parse', 'isEqual', 'name', 'subscription', 'validate', 'validateFields', 'value']);

    var _ref = this.state.state || {},
        blur = _ref.blur,
        change = _ref.change,
        focus = _ref.focus,
        value = _ref.value,
        ignoreName = _ref.name,
        otherState = objectWithoutProperties(_ref, ['blur', 'change', 'focus', 'value', 'name']);

    var meta = {
      // this is to appease the Flow gods
      active: otherState.active,
      data: otherState.data,
      dirty: otherState.dirty,
      dirtySinceLastSubmit: otherState.dirtySinceLastSubmit,
      error: otherState.error,
      initial: otherState.initial,
      invalid: otherState.invalid,
      pristine: otherState.pristine,
      submitError: otherState.submitError,
      submitFailed: otherState.submitFailed,
      submitSucceeded: otherState.submitSucceeded,
      touched: otherState.touched,
      valid: otherState.valid,
      visited: otherState.visited
    };
    if (formatOnBlur) {
      value = Field.defaultProps.format(value, name);
    } else if (format) {
      value = format(value, name);
    }
    if (value === null && !allowNull) {
      value = '';
    }
    var input = _extends({ name: name, value: value }, this.handlers);
    if (rest.type === 'checkbox') {
      if (_value === undefined) {
input.checked = !!value;
      } else {
input.checked = !!(Array.isArray(value) && ~value.indexOf(_value));
        input.value = _value;
      }
    } else if (rest.type === 'radio') {
input.checked = value === _value;
      input.value = _value;
    } else if (component === 'select' && rest.multiple) {
      input.value = input.value || [];
    }

    if (typeof children === 'function') {
      return children(_extends({ input: input, meta: meta }, rest));
    }

    if (typeof component === 'string') {
      // ignore meta, combine input with any other props
      return React.createElement(component, _extends({}, input, { children: children }, rest));
    }
    var renderProps = { input: input, meta: meta // assign to force Flow check
    };return renderComponent(_extends({}, renderProps, { children: children, component: component }, rest), 'Field(' + name + ')');
  };

  return Field;
}(React.Component);

Field.contextTypes = {
  reactFinalForm: PropTypes.object
};
Field.defaultProps = {
  format: function format(value, name) {
    return value === undefined ? '' : value;
  },
  parse: function parse(value, name) {
    return value === '' ? undefined : value;
  }
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.subscribe = function (_ref2, listener) {
    var isEqual = _ref2.isEqual,
        name = _ref2.name,
        subscription = _ref2.subscription,
        validateFields = _ref2.validateFields;

    _this2.unsubscribe = _this2.context.reactFinalForm.registerField(name, listener, subscription || all, {
      isEqual: isEqual,
      getValidator: function getValidator() {
        return _this2.props.validate;
      },
      validateFields: validateFields
    });
  };

  this.notify = function (state) {
    return _this2.setState({ state: state });
  };

  this.handlers = {
    onBlur: function onBlur(event) {
      var state = _this2.state.state;
      // this is to appease the Flow gods
      // istanbul ignore next

      if (state) {
        var _props3 = _this2.props,
            format = _props3.format,
            formatOnBlur = _props3.formatOnBlur;

        state.blur();
        if (format && formatOnBlur) {
          state.change(format(state.value, state.name));
        }
      }
    },
    onChange: function onChange(event) {
      var _props4 = _this2.props,
          parse = _props4.parse,
          _value = _props4.value;

      // istanbul ignore next

      if (process.env.NODE_ENV !== 'production' && event && event.target) {
        var targetType = event.target.type;
        var props = _this2.props;
        var unknown = ~['checkbox', 'radio', 'select-multiple'].indexOf(targetType) && !props.type;

        var type = targetType === 'select-multiple' ? 'select' : targetType;

        var _ref3 = targetType === 'select-multiple' ? _this2.state.state || {} : props,
            _value2 = _ref3.value;

        if (unknown) {
          console.error('Warning: You must pass `type="' + type + '"` prop to your Field(' + props.name + ') component.\n' + ('Without it we don\'t know how to unpack your `value` prop - ' + (Array.isArray(_value2) ? '[' + _value2 + ']' : '"' + _value2 + '"') + '.'));
        }
      }

      var value = event && event.target ? getValue(event, _this2.state.state && _this2.state.state.value, _value, isReactNative) : event;
      _this2.state.state && _this2.state.state.change(parse ? parse(value, _this2.props.name) : value);
    },
    onFocus: function onFocus(event) {
      _this2.state.state && _this2.state.state.focus();
    }
  };
};

//      
var shallowEqual = function shallowEqual(a, b) {
  if (a === b) {
    return true;
  }
  if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' || !a || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' || !b) {
    return false;
  }
  var keysA = Object.keys(a);
  var keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(b);
  for (var idx = 0; idx < keysA.length; idx++) {
    var key = keysA[idx];
    if (!bHasOwnProperty(key) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

//      
var isSyntheticEvent = function isSyntheticEvent(candidate) {
  return !!(candidate && typeof candidate.stopPropagation === 'function');
};

//      

var version = '3.6.0';

var versions = {
  'final-form': finalForm.version,
  'react-final-form': version
};

var all$1 = finalForm.formSubscriptionItems.reduce(function (result, key) {
  result[key] = true;
  return result;
}, {});

var ReactFinalForm = function (_React$Component) {
  inherits(ReactFinalForm, _React$Component);

  function ReactFinalForm(props) {
    classCallCheck(this, ReactFinalForm);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.notify = function (state) {
      if (_this.mounted) {
        _this.setState({ state: state });
      }
      _this.mounted = true;
    };

    _this.handleSubmit = function (event) {
      if (event) {
        // sometimes not true, e.g. React Native
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        if (typeof event.stopPropagation === 'function') {
          // prevent any outer forms from receiving the event too
          event.stopPropagation();
        }
      }
      return _this.form.submit();
    };

    var children = props.children,
        component = props.component,
        render = props.render,
        subscription = props.subscription,
        decorators = props.decorators,
        rest = objectWithoutProperties(props, ['children', 'component', 'render', 'subscription', 'decorators']);

    var config = rest;
    _this.mounted = false;
    try {
      _this.form = finalForm.createForm(config);
    } catch (e) {
      // istanbul ignore next
      if (process.env.NODE_ENV !== 'production') {
        console.error('Warning: ' + e.message);
      }
    }
    _this.unsubscriptions = [];
    if (_this.form) {
      // set initial state
      var initialState = {};
      _this.form.subscribe(function (state) {
        initialState = state;
      }, subscription || all$1)();
      _this.state = { state: initialState };
    }
    if (decorators) {
      decorators.forEach(function (decorator) {
        _this.unsubscriptions.push(decorator(_this.form));
      });
    }
    return _this;
  }

  ReactFinalForm.prototype.getChildContext = function getChildContext() {
    return {
      reactFinalForm: this.form
    };
  };

  ReactFinalForm.prototype.componentWillMount = function componentWillMount() {
    if (this.form) {
      this.form.pauseValidation();
    }
  };

  ReactFinalForm.prototype.componentDidMount = function componentDidMount() {
    if (this.form) {
      this.unsubscriptions.push(this.form.subscribe(this.notify, this.props.subscription || all$1));
      this.form.resumeValidation();
    }
  };

  ReactFinalForm.prototype.componentWillUpdate = function componentWillUpdate() {
    // istanbul ignore next
    if (this.form) {
      this.resumeValidation = this.resumeValidation || !this.form.isValidationPaused();
      this.form.pauseValidation();
    }
  };

  ReactFinalForm.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    var _this2 = this;

    // istanbul ignore next
    if (this.form && this.resumeValidation) {
      this.form.resumeValidation();
    }
    if (this.props.initialValues && !(this.props.initialValuesEqual || shallowEqual)(prevProps.initialValues, this.props.initialValues)) {
      this.form.initialize(this.props.initialValues);
    }
    finalForm.configOptions.forEach(function (key) {
      if (key === 'initialValues' || prevProps[key] === _this2.props[key]) {
        return;
      }
      _this2.form.setConfig(key, _this2.props[key]);
    });
    // istanbul ignore next
    if (process.env.NODE_ENV !== 'production') {
      if (!shallowEqual(prevProps.decorators, this.props.decorators)) {
        console.error('Warning: Form decorators should not change from one render to the next as new values will be ignored');
      }
      if (!shallowEqual(prevProps.subscription, this.props.subscription)) {
        console.error('Warning: Form subscription should not change from one render to the next as new values will be ignored');
      }
    }
  };

  ReactFinalForm.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscriptions.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  ReactFinalForm.prototype.render = function render() {
    var _this3 = this;

    // remove config props
    var _props = this.props,
        debug = _props.debug,
        initialValues = _props.initialValues,
        mutators = _props.mutators,
        onSubmit = _props.onSubmit,
        subscription = _props.subscription,
        validate = _props.validate,
        validateOnBlur = _props.validateOnBlur,
        props = objectWithoutProperties(_props, ['debug', 'initialValues', 'mutators', 'onSubmit', 'subscription', 'validate', 'validateOnBlur']);

    var renderProps = _extends({}, this.state ? this.state.state : {}, {
      batch: this.form && function (fn) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.batch() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.batch() instead. Check your ReactFinalForm render prop.');
        }
        return _this3.form.batch(fn);
      },
      blur: this.form && function (name) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.blur() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.blur() instead. Check your ReactFinalForm render prop.');
        }
        return _this3.form.blur(name);
      },
      change: this.form && function (name, value) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.change() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.change() instead. Check your ReactFinalForm render prop.');
        }
        return _this3.form.change(name, value);
      },
      focus: this.form && function (name) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.focus() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.focus() instead. Check your ReactFinalForm render prop.');
        }
        return _this3.form.focus(name);
      },
      form: _extends({}, this.form, {
        reset: function reset(eventOrValues) {
          if (isSyntheticEvent(eventOrValues)) {
            // it's a React SyntheticEvent, call reset with no arguments
            _this3.form.reset();
          } else {
            _this3.form.reset(eventOrValues);
          }
        }
      }),
      handleSubmit: this.handleSubmit,
      initialize: this.form && function (values) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.initialize() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.initialize() instead. Check your ReactFinalForm render prop.');
        }
        return _this3.form.initialize(values);
      },
      mutators: this.form && Object.keys(this.form.mutators).reduce(function (result, key) {
        result[key] = function () {
          var _form$mutators;

          (_form$mutators = _this3.form.mutators)[key].apply(_form$mutators, arguments);
          // istanbul ignore next
          if (process.env.NODE_ENV !== 'production') {
            console.error('Warning: As of React Final Form v3.3.0, props.mutators is deprecated and will be removed in the next major version of React Final Form. Use: props.form.mutators instead. Check your ReactFinalForm render prop.');
          }
        };
        return result;
      }, {}),
      reset: this.form && function (values) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.reset() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.reset() instead. Check your ReactFinalForm render prop.');
        }
        return _this3.form.reset(values);
      }
    });
    return renderComponent(_extends({}, props, renderProps, {
      __versions: versions
    }), 'ReactFinalForm');
  };

  return ReactFinalForm;
}(React.Component);

ReactFinalForm.childContextTypes = {
  reactFinalForm: PropTypes.object
};

//      

var FormSpy = function (_React$Component) {
  inherits(FormSpy, _React$Component);

  function FormSpy(props, context) {
    classCallCheck(this, FormSpy);

    var _this = possibleConstructorReturn(this, _React$Component.call(this, props, context));

    _this.subscribe = function (_ref, listener) {
      var subscription = _ref.subscription;

      _this.unsubscribe = _this.context.reactFinalForm.subscribe(listener, subscription || all$1);
    };

    _this.notify = function (state) {
      _this.setState({ state: state });
      if (_this.props.onChange) {
        _this.props.onChange(state);
      }
    };

    var initialState = void 0;

    // istanbul ignore next
    if (process.env.NODE_ENV !== 'production' && !context.reactFinalForm) {
      console.error('Warning: FormSpy must be used inside of a ReactFinalForm component');
    }

    if (_this.context.reactFinalForm) {
      // avoid error, warning will alert developer to their mistake
      _this.subscribe(props, function (state) {
        if (initialState) {
          _this.notify(state);
        } else {
          initialState = state;
          if (props.onChange) {
            props.onChange(state);
          }
        }
      });
    }
    if (initialState) {
      _this.state = { state: initialState };
    }
    return _this;
  }

  FormSpy.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    var subscription = this.props.subscription;

    if (diffSubscription(prevProps.subscription, subscription, finalForm.formSubscriptionItems)) {
      if (this.context.reactFinalForm) {
        // avoid error, warning will alert developer to their mistake
        this.unsubscribe();
        this.subscribe(this.props, this.notify);
      }
    }
  };

  FormSpy.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe();
  };

  FormSpy.prototype.render = function render() {
    var _props = this.props,
        onChange = _props.onChange,
        subscription = _props.subscription,
        rest = objectWithoutProperties(_props, ['onChange', 'subscription']);
    var reactFinalForm = this.context.reactFinalForm;

    var renderProps = {
      batch: reactFinalForm && function (fn) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.batch() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.batch() instead. Check your FormSpy render prop.');
        }
        return reactFinalForm.batch(fn);
      },
      blur: reactFinalForm && function (name) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.blur() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.blur() instead. Check your FormSpy render prop.');
        }
        return reactFinalForm.blur(name);
      },
      change: reactFinalForm && function (name, value) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.change() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.change() instead. Check your FormSpy render prop.');
        }
        return reactFinalForm.change(name, value);
      },
      focus: reactFinalForm && function (name) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.focus() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.focus() instead. Check your FormSpy render prop.');
        }
        return reactFinalForm.focus(name);
      },
      form: _extends({}, reactFinalForm, {
        reset: function reset(eventOrValues) {
          if (isSyntheticEvent(eventOrValues)) {
            // it's a React SyntheticEvent, call reset with no arguments
            reactFinalForm.reset();
          } else {
            reactFinalForm.reset(eventOrValues);
          }
        }
      }),
      initialize: reactFinalForm && function (values) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.initialize() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.initialize() instead. Check your FormSpy render prop.');
        }
        return reactFinalForm.initialize(values);
      },
      mutators: reactFinalForm && Object.keys(reactFinalForm.mutators).reduce(function (result, key) {
        result[key] = function () {
          var _reactFinalForm$mutat;

          (_reactFinalForm$mutat = reactFinalForm.mutators)[key].apply(_reactFinalForm$mutat, arguments);
          // istanbul ignore next
          if (process.env.NODE_ENV !== 'production') {
            console.error('Warning: As of React Final Form v3.3.0, props.mutators is deprecated and will be removed in the next major version of React Final Form. Use: props.form.mutators instead. Check your FormSpy render prop.');
          }
        };
        return result;
      }, {}),
      reset: reactFinalForm && function (values) {
        // istanbul ignore next
        if (process.env.NODE_ENV !== 'production') {
          console.error('Warning: As of React Final Form v3.3.0, props.reset() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.reset() instead. Check your FormSpy render prop.');
        }
        return reactFinalForm.reset(values);
      }
    };
    return onChange ? null : renderComponent(_extends({}, rest, this.state ? this.state.state : {}, renderProps), 'FormSpy');
  };

  return FormSpy;
}(React.Component);

FormSpy.contextTypes = {
  reactFinalForm: PropTypes.object
};

//

exports.Field = Field;
exports.Form = ReactFinalForm;
exports.version = version;
exports.FormSpy = FormSpy;
