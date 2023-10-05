(() => {
  addEventListener("DOMContentLoaded", (event) => {
    bbn.fn.init({
      env: {
        logging: data.is_dev || data.is_test ? true : false,
        isDev: data.is_dev ? true : false,
        mode: data.is_dev ? 'dev' : (data.is_test ? 'test' : 'prod'),
        lang: data.lang,
        connection_failures: 0,
        connection_max_failures: 10,
        cdn: data.shared_path
      },
      lng: bbn.fn.extend(true, {}, data.lng || {}),
      opt: data.options || {}
    });
    const svg = `<svg width="100%" version="1.1" viewBox="0 0 37.921 30" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(-52.823 -101.69)">
    <g transform="translate(50.748 97.989)">
      <polygon class="cls-1" transform="matrix(.35714 0 0 .35714 2.0747 3.7019)" points="50.55 78.18 67.27 61.45 50.55 44.73 39.27 56 33.45 50.18 44.73 38.91 22.55 16.73 0 39.27 28 67.27 33.82 61.45" fill="#b3b3b3"/>
      <polygon transform="matrix(.35714 0 0 .35714 2.0747 3.7019)" points="50.55 44.73 39.27 56 33.45 50.18 83.64 0 106.18 22.55 67.27 61.45" fill="#4d4d4d"/>
      <rect transform="rotate(-45)" x="-11.067" y="28.145" width="2.9392" height="8.4499" fill="#4d4d4d" stroke-width=".35714"/>
    </g>
  </g>
</svg>
`;
    window.app = bbn.cp.createApp(document.body.querySelector('div.appui-login'), {
      props: {
        zIndex: {
          type: Number,
          default: 1
        }
      },
      data(){
        return bbn.fn.extend({
          isInit: false,
          url: bbn.env.path.split('?')[0],
          popup: false,
          lostPassForm: false,
          lostPassFormData: {
            email: ''
          },
          currentLogo: data.logo || svg,
          clientHeight: document.documentElement.clientHeight,
          isMobile: bbn.fn.isMobile(),
          isTablet: bbn.fn.isTabletDevice(),
          custom: data.custom || ''
        }, data);
      },
      methods: {
        submited(d){
          if ( d == 1 ){
            window.document.location.href = bbn.env.path;
          }
          else {
            this.alert(d.errorMessage, bbn.lng.error);
          }
        },
        lostPasssubmited(d){
          if ( d.success ){
            this.alert(bbn._('An email has been sent to') + ' ' + this.lostPassFormData.email, bbn._('Info'));
            this.hideLostPassForm();
          }
        },
        hideLostPassForm(){
          this.lostPassForm = false;
          this.lostPassFormData.email = '';
        },
        setHeight(){
          this.clientHeight = document.documentElement.clientHeight;
        },
        init() {
          if (!this.isInit) {
            bbn.fn.log("INIT");
            setTimeout(() => {
              this.popup = this.getRef('popup');
              setTimeout(() => {
                let ele =  this.$root.$el;
                ele.style.opacity = '1';
                bbn.fn.each(ele.querySelectorAll("input"), (element, i) => {
                  if ( (element.style.visibility === 'visible') ){
                    element.focus();
                    return false;
                  }
                })
              }, 500);
              setTimeout(() => {
                this.$root.innerHTML = `
        <h2>`+ bbn._('Refresh the page to be able to log in or click') + ` <a class="bbn-p" onclick="window.location.reload();">` + bbn._('HERE') + `</a></h2>`;
              }, 1200000);
            }, 500);
            this.isInit = true;
          }
        }
      },
      created(){
        if ( this.isMobile ){
          document.body.classList.add('bbn-mobile');
        }
        if ( this.isTablet ){
          document.body.classList.add('bbn-tablet');
        }
      },
      mounted(){
        window.addEventListener('resize', this.setHeight);
        this.init();
      },
      beforeDestroy(){
        window.removeEventListener('resize', this.setHeight);
      },
    });
  });
})();
