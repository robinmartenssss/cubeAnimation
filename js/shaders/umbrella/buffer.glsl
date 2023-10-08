 uniform vec3 iResolution; 
 uniform float iTime; 
 uniform vec4 iMouse; 

 varying vec2 vUv;


void mainImage( out vec4 fragColor, in vec2 fragCoord ) {

	float M   = iTime * 0.5;
	float fog = 1.0;
	vec2 uv   = 2.0 * ( fragCoord.xy / iResolution.xy ) - 1.0;
	     uv  *= vec2(iResolution.x / iResolution.y, 1.0);
	     uv   = rot(uv, -iMouse.y * 0.015);
	vec3  c   = vec3(0);
	for(int i = 0 ; i < ITE_MAX; i++) {
		c = tex(vec2(uv.x / abs(uv.y / (float(i) + 1.0)) + M + iMouse.x * 0.015, abs(uv.y)));
		if(length(c) > 0.5) break;
		uv   = uv.yx * 1.3;
		fog *= 0.9;
	}
  fragColor = (1.0 - vec4(c.xyyy * (fog * fog)));
    fragColor.a = fog;
	
}

void main (){
    vec2 fragCoord = iResolution * vUv;
    mainImage(gl_FragColor, gl_FragCoord.xy);
}