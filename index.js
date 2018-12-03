const directives = {
  text(value) {
    this.el.textContent = value || ''
  },
  show(value) {
    this.el.style.display = value ? '' : 'none'
  },
  class(value) {
    this.el.classList.add(value)
  }
}

class Directive {
  constructor(name, value) {
    this.name = name
    this.value = value
  }

  update(value) {
    directives[this.name].call(this, value)
  }
}

export default class Vue {
  constructor(el, data) {
    this.el = document.querySelector(el)
    this.bindings = {}
    this.scope = {}
    this.prefix = 'rv'

    this.compile(this.el)
    for (let key in data) {
      this.scope[key] = data[key]
    }
  }

  compile(node) {
    const self = this

    if (node.nodeType === 1) {
      Array.prototype.slice.call(node.attributes).forEach(attr => {
        if (!attr.name.startsWith(`${this.prefix}-`)) return

        const name = attr.name.replace(new RegExp(`^${this.prefix}-`), '')
        const directive = new Directive(name, attr.value)
        self.bind(node, directive)
      })

      node.childNodes.forEach(childNode => this.compile(childNode))
    }
  }

  bind(node, directive) {
    directive.el = node
    node.removeAttribute(`${this.prefix}-${directive.name}`)

    const key = directive.value
    let binding = this.bindings[key]

    if (!binding) {
      binding = {
        directives: []
      }

      Object.defineProperty(this.scope, key, {
        get() {
          return binding.value
        },
        set(value) {
          binding.value = value
          binding.directives.forEach(_directive => _directive.update(value))
        }
      })

      this.bindings[key] = binding
    }

    binding.directives.push(directive)
  }
}