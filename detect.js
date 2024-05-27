return async ()=>{ /**
 * @enum {string}
 */
const browser = Object.freeze({
      FIREFOX: 'Firefox',
      CHROME: 'Chrome',
      IE: "Trident", 
      MS_IE: "MSIE",
      OPERA: "Opera", 
      SAFARI: "Safari",
      IPHONE_SAFARI: "iPhone",
      IPAD_SAFARI: "iPad",
      WEBKIT: 'AppleWebKit',
      GECKO: 'Gecko',
      MS_EDGE: 'Edge',
      CHROMIUM_EDGE: 'Edg/',
      NINTENDO: ' NintendoBrowser',
      UNKNOWN: 'unk',
});
/**
 * @enum {string}
 */
const os = Object.freeze({
      NINTENDO: 'Nintendo',
      PLAYSTATION: 'PlayStation',
      XBOX: 'XBox',
      ANDROID: 'Android',
      IPHONE: 'iPhone',
      IPAD: 'iPad',
      WINDOWS_PHONE: 'Windows Phone',
      MAC: 'Mac',
      WINDOWS: 'Win',
      UNIX: 'X11',
      CHROMECAST: 'CrKey',
      ROKU: 'Roku',
      LINUX: 'Linux',
      UNKNOWN: 'unknown',
})
/**
 * return the actual os used
 * @returns {os}
 */
const detectOs = ()=>{
      if( !navigator || !('userAgent' in navigator)){
            return os.UNKNOWN;
      }
      for( const platform of Object.values( os ) ){
            if( navigator.userAgent.indexOf(platform) >= 0 )
                  return platform;
      }
      return os.UNKNOWN;
}
/**
 * return the actual browser used
 * @returns {browser}
 */
const detectBrowser = ()=>{
      if( !navigator || !('userAgent' in navigator)){
            return browser.UNKNOWN;
      }
      for( const b of Object.values( browser ) ){
            if( navigator.userAgent.indexOf(b) >= 0 )
                  return b;
      }
      return browser.UNKNOWN;
}
const checkIfMobilePlatform = ()=>{
      const checkOs = detectOs();
      return checkOs == os.ANDROID || checkOs == os.IPHONE || checkOs == os.WINDOW_PHONE;
}
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData for more information about compatibility
 * @returns {boolean} if device is mobile
 */
const isMobile = ()=>{
      if( !navigator )
            return false;
      if( !('userAgentData' in navigator) )
            return checkIfMobilePlatform();
      return navigator.userAgentData.mobile;
}
/**
 * returns the browser version detected via user agent
 * @returns {number} Browser version
 */
const detectBrowserVersion = ()=>{
      if( !navigator || !('userAgent' in navigator) )
            return 0.0;
      const browser = detectBrowser();

      return parseFloat(
            navigator.userAgent.substring( 
                  navigator.userAgent.indexOf( browser ) + browser.length + 1
            )
      )
}
/**
 * return the user agent data about:
 * - browser
 * - browserVersion
 * - os
 * @returns {{
 *     browser: browser,
 *     browserVersion: number,
 *     os: os
 * }}
 */
const getUserAgentInfo = (()=>{
      const data = {
            browser: detectBrowser(),
            browserVersion: detectBrowserVersion(),
            os: detectOs(),
      }
      return ()=>{
            return data;
      }
})()

const brow = detectBrowser();
const RiskClass = Object.freeze({
      LOW: 'green',
      MID: 'yellow', 
      HIGH: 'red',
})
const logMessage = ( message, risk = RiskClass.LOW ) => {
      console.log( `[BOT-DETECTOR] %c${message}`, `color: ${risk}` )
      const h1 = document.createElement('h1');
      h1.innerHTML = `[BOT-DETECTOR] ${message}`
      h1.style.color = `${risk}`;
      document.body.append(h1)
}
const fail = ( error )=>{
      logMessage( " bot detected ", RiskClass.HIGH );
      error();
      return;
}
const hashString = ( src )=>{
      let hash = 0;
      
      for (let i = 0; i < src.length; i++) {
            let char = src.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash;
      }
      return hash;
}
const gpuFingerprint = ()=>{
      const cvs = document.createElement('canvas');
      const gl = cvs.getContext('webgl') || cvs.getContext('experimental-webgl');
      let infos = '';

      if( gl ){
            try{
                  infos = gl.getParameter(gl.RENDERER);
            }catch{
                  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                  const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                  infos = vendor + renderer;
            }
      }
      return hashString(infos);
}
const cvsFingerprint = ()=>{

      const cvs = document.createElement( 'canvas' );
      const ctx = cvs.getContext('2d');

      ctx.fillStyle = '#000';
      ctx.fillRect( 0, 0, window.innerWidth, window.innerHeight )
      ctx.fillRect( 100, 10, 100, 1000 );
      ctx.fillStyle = '#f00';
      ctx.fillRect( 100, 10, 100, 1000 );
      ctx.fillStyle = '#05a';
      ctx.beginPath();
      ctx.ellipse(100, 100, 50, 75, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill()
      ctx.beginPath();
      ctx.fillStyle = '#0ff'

      ctx.moveTo( 30, 50 )
      ctx.lineTo( 10, 10 );
      ctx.lineTo( 90, 10 );
      ctx.lineTo( 30, 50 );
      
      ctx.fill()
      ctx.beginPath();
      ctx.moveTo( 550, 550 )
      ctx.lineTo( 0, 0 );
      ctx.lineTo( 100, -100 );
      ctx.lineTo( 550, 550 );
      ctx.clip()
      ctx.fillStyle = '#714';
      ctx.fillRect( 0, 0, 550, 550 )
      ctx.fillStyle = '#3f7';
      ctx.fillText( 'abcdefghilmnopqrstuv$%/(£=2294489)((((9[l++}èxzwy j', 0, 100 )
      ctx.fillStyle = '#774';
      ctx.fillRect( 0, 95, 1000, 2 );
      ctx.fillText( '👻👾🦾', 100, 50 )

      const src = cvs.toDataURL();
      
      return hashString(src);
}

const detect = async ( success, error ) => {

      if( brow == browser.UNKNOWN ){
            return false;
      }

      if( navigator.webdriver == true ){
            return false;
      }

      if( !window.outerHeight || !window.outerWidth ){
            return false;
      }
      const cvsFP = cvsFingerprint();
      const gpuFP = gpuFingerprint();

      console.log( cvsFP );

      const response = await fetch( 'http://localhost:3000/fingerprint', {
            method: 'POST',
            headers: {
                  'Content-type': 'application/json',
            },
            body: `{"hash": "${cvsFP}"}`

      })
      return (await response.json()).ok
}
return await detect() 
}