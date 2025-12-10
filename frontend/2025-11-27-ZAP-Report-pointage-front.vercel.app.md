# ZAP by Checkmarx Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Niveau de risque | Number of Alerts |
| --- | --- |
| Haut | 0 |
| Moyen | 4 |
| Faible | 2 |
| Pour information | 4 |




## Alertes

| Nom | Niveau de risque | Number of Instances |
| --- | --- | --- |
| CSP: Wildcard Directive | Moyen | 4 |
| CSP: script-src unsafe-eval | Moyen | 4 |
| CSP: style-src unsafe-inline | Moyen | 4 |
| Mauvaise configuration inter-domaines | Moyen | 148 |
| Private IP Disclosure | Faible | 5 |
| X-Content-Type-Options Header Missing | Faible | 148 |
| Information Disclosure - Suspicious Comments | Pour information | 4 |
| Modern Web Application | Pour information | 4 |
| Re-examine Cache-control Directives | Pour information | 4 |
| Retrieved from Cache | Pour information | 158 |




## Alert Detail



### [ CSP: Wildcard Directive ](https://www.zaproxy.org/docs/alerts/10055/)



##### Moyen (Haut)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-42wx2Nizr+07x4+Qh3dEp4og' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
style-src, img-src, connect-src, frame-src, font-src, manifest-src`
* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-s5PDP8uXQCNSmJp6BZVSrj/P' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
style-src, img-src, connect-src, frame-src, font-src, manifest-src`
* URL: https://pointage-front.vercel.app/

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-Xftj6hZ7ehaFSzTqQvRSfgBF' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
style-src, img-src, connect-src, frame-src, font-src, manifest-src`
* URL: https://pointage-front.vercel.app/sitemap.xml

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-Xr45BWjyoWcmC+p3Cis6lYJB' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `The following directives either allow wildcard sources (or ancestors), are not defined, or are overly broadly defined:
style-src, img-src, connect-src, frame-src, font-src, manifest-src`


Instances: 4

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources ](https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: script-src unsafe-eval ](https://www.zaproxy.org/docs/alerts/10055/)



##### Moyen (Haut)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-42wx2Nizr+07x4+Qh3dEp4og' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `script-src includes unsafe-eval.`
* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-s5PDP8uXQCNSmJp6BZVSrj/P' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `script-src includes unsafe-eval.`
* URL: https://pointage-front.vercel.app/

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-Xftj6hZ7ehaFSzTqQvRSfgBF' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `script-src includes unsafe-eval.`
* URL: https://pointage-front.vercel.app/sitemap.xml

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-Xr45BWjyoWcmC+p3Cis6lYJB' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `script-src includes unsafe-eval.`


Instances: 4

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources ](https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ CSP: style-src unsafe-inline ](https://www.zaproxy.org/docs/alerts/10055/)



##### Moyen (Haut)

### Description

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-42wx2Nizr+07x4+Qh3dEp4og' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-s5PDP8uXQCNSmJp6BZVSrj/P' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://pointage-front.vercel.app/

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-Xftj6hZ7ehaFSzTqQvRSfgBF' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `style-src includes unsafe-inline.`
* URL: https://pointage-front.vercel.app/sitemap.xml

  * Méthode: `GET`
  * Parameter: `Content-Security-Policy`
  * Attaquer: ``
  * Evidence: `base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https: http://localhost:3001 https://api.iconify.design; object-src 'none'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; script-src 'self' 'nonce-Xr45BWjyoWcmC+p3Cis6lYJB' 'strict-dynamic' 'unsafe-eval' https://vercel.live; upgrade-insecure-requests; media-src 'self' blob: data:;`
  * Other Info: `style-src includes unsafe-inline.`


Instances: 4

### Solution

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

### Reference


* [ https://www.w3.org/TR/CSP/ ](https://www.w3.org/TR/CSP/)
* [ https://caniuse.com/#search=content+security+policy ](https://caniuse.com/#search=content+security+policy)
* [ https://content-security-policy.com/ ](https://content-security-policy.com/)
* [ https://github.com/HtmlUnit/htmlunit-csp ](https://github.com/HtmlUnit/htmlunit-csp)
* [ https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources ](https://developers.google.com/web/fundamentals/security/csp#policy_applies_to_a_wide_variety_of_resources)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Mauvaise configuration inter-domaines ](https://www.zaproxy.org/docs/alerts/10098/)



##### Moyen (Moyen)

### Description

Web browser data loading may be possible, due to a Cross Origin Resource Sharing (CORS) misconfiguration on the web server.

* URL: https://pointage-front.vercel.app/_nuxt/ad.B18i8NGa.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ad.Blhdm5jl.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/af.Bc2fqp73.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/af.C77Rf6cE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/arab.C-KgnQEz.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/arab.C4CYPgyC.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/as.BTEVCXG-.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/as.Dekqy8Of.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/aw.CLCX8uk5.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/aw.W0PWLK5p.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bm.BeYgB2z9.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bm.DvNWWcPM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bn.B6T3O78g.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bn.CPQcA8Ol.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bo.CcUiMqkJ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bo.Dry0C6UA.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/br.Cu5YU29T.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/br.Dr5rMAMb.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/Br6EKXX7.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bt.BTo4qm10.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bt.SxWnbWW0.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/builds/meta/646009bf-06a2-4ad4-acd5-a05052b170df.json

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bz.BCKHR4_q.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/bz.CoBdB-p8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/CaO_N1Km.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/Ce44rwk6.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/cy.bZuP8hmf.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/cy.DJKnEFYW.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/dg.CJPJrjiZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/dg.DqkWLbnk.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/dm.Cbhezfe1.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/dm.DPPHwW2M.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/do.B86d445t.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/do.DeRnbj4d.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/eac.CwGQsyAM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/eac.h4QKADRE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ec.CaVOFQ3t.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ec.cwfBJlvF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/eg.DwOkwyQ0.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/eg.YC70hswZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/entry.DWxhBv24.css

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/es-ga.D9xG2hYr.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/es-ga.DXhVZ333.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/es.BuSGTZm_.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/es.d5m8M5h8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/fj.DEAVMg38.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/fj.u3dAPoew.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/fk.B-RvQ4Hz.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/fk.nuUF_Ak3.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-nir.D4gikpNq.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-nir.vEp1ZXy6.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-wls.Bxz9hxvX.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-wls.CK0XlKT-.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gq.Cag8QTk2.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gq.CPnMO1hT.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gs.DiiNa0F5.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gs.DOgYbHsY.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gt.BLpn5qMn.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gt.CJo5DI-7.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gu.Di1JYREk.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/gu.SbvrH0uZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/hr.BpiVVBoV.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/hr.fzLfaANM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ht.DIMg4gti.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ht.pweRl6ZP.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/im.-VPIqfkF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/im.Dd9p-0-T.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/io.13HOfeJD.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/io.BImhNBcd.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ir.cCIgaNf6.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ir.Q03Mij62.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/je.DyWbhIiC.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/je.vXe0Dr49.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/kg.B0FsxZiL.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/kg.CjfitMyT.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/kh.BBvObpUS.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/kh.BeWfuE30.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ki.fuIMkEYQ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ki.p_fAQGbS.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ky.BqaZHuhf.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ky.Dpsu1myA.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/kz.CwKXYZ8s.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/kz.Dkyx6q-p.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/li.CHdhvNcr.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/li.CMlf0YU8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/lk.DSQoDxn_.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/lk.DUkgV9Tq.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/md.DRlxvNwm.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/md.DTi94M3M.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/me.CfGorN3b.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/me.Cv4Gwqah.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/mp.CrOApEqW.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/mp.CuaQmCLf.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ms.B-w7hFKu.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ms.DxciGbUu.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/mt.YDa8zgzO.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/mt.YqzKx9xl.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/mx.Cc8Ccfe8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/mx.CvCwYHGF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/nf.DGrQb42O.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/nf.Dl00mlk2.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ni.BX2WCaNt.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/ni.CcFCSQxm.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/om.DcqxRdQL.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/om.nN8zP2Bu.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/pn.BPAlH32D.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/pn.DgxdtieE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/primeicons.Dr5RGzOO.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/pt.BTevY6N2.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/pt.DZ2ADgIR.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/py.BKi5dxWt.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/py.mNzh0mZC.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/rs.BfwKwXtn.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/rs.CnTO3ehk.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sa.Dh79zbT9.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sa.DnlyVVKx.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.D-aE2xRW.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.FjwY7RYr.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-hl.CgxUDvtv.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-hl.CqtQPzWZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ta.BFo5zkKU.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ta.CPJublpi.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sm.BKrUHzrq.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sm.DGBIRFB_.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sv.CJIHhYwF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sv.RZ39q5hO.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sx.nDhIaDNb.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sx.RKKs0ph6.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sz.D39eIL5d.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/sz.qxMwa2gs.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/tc.CJHJmJj1.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/tc.dtelpZmc.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/tm.C_WSgUcv.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/tm.DGBJvQay.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/un.Bqg4Cbbh.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/un.DabL4p35.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/va.B9-hqIE-.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/va.s7kyhqIM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/vg.C7xY6pic.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/vg.ClZ-0KpG.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/vi.BC_zcciE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/vi.BSdsyIxY.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/xk.Bj15g7cp.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/xk.Cdz2uTvR.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/zm.BmsW91ne.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/zm.D8B-0kdx.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/zw.CSuuaw9K.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`
* URL: https://pointage-front.vercel.app/_nuxt/zw.U0m7oJ5e.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Access-Control-Allow-Origin: *`
  * Other Info: `De la CORS mauvaise configuration sur le serveur web permet à la croix-domaine de demandes de lecture de l'arbitraire tiers domaines, non authentifié à l'aide d'Api sur ce domaine. Navigateur Web implémentations ne permettent pas de l'arbitraire des tiers pour lire la réponse d'authentification APIs, cependant. Cela réduit quelque peu le risque. Cette erreur de configuration peut être utilisé par un attaquant d'accéder à des données qui sont disponibles dans un non authentifié de manière, mais qui utilise une autre forme de sécurité, telles que l'adresse IP de liste-blanche.`


Instances: 148

### Solution

Ensure that sensitive data is not available in an unauthenticated manner (using IP address white-listing, for instance).
Configure the "Access-Control-Allow-Origin" HTTP header to a more restrictive set of domains, or remove all CORS headers entirely, to allow the web browser to enforce the Same Origin Policy (SOP) in a more restrictive manner.

### Reference


* [ https://vulncat.fortify.com/en/detail?id=desc.config.dotnet.html5_overly_permissive_cors_policy ](https://vulncat.fortify.com/en/detail?id=desc.config.dotnet.html5_overly_permissive_cors_policy)


#### CWE Id: [ 264 ](https://cwe.mitre.org/data/definitions/264.html)


#### WASC Id: 14

#### Source ID: 3

### [ Private IP Disclosure ](https://www.zaproxy.org/docs/alerts/2/)



##### Faible (Moyen)

### Description

A private IP (such as 10.x.x.x, 172.x.x.x, 192.168.x.x) or an Amazon EC2 private hostname (for example, ip-10-0-56-78) has been found in the HTTP response body. This information might be helpful for further attacks targeting internal systems.

* URL: https://pointage-front.vercel.app/_nuxt/do.B86d445t.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `10.3.1.1`
  * Other Info: `10.3.1.1
`
* URL: https://pointage-front.vercel.app/_nuxt/entry.DWxhBv24.css

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `10.3.1.1`
  * Other Info: `10.3.1.1
`
* URL: https://pointage-front.vercel.app/_nuxt/gb-wls.Bxz9hxvX.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `10.3.2.4`
  * Other Info: `10.3.2.4
`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.D-aE2xRW.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `10.4.2.3`
  * Other Info: `10.4.2.3
`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.FjwY7RYr.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `10.4.2.3`
  * Other Info: `10.4.2.3
`


Instances: 5

### Solution

Remove the private IP address from the HTTP response body. For comments, use JSP/ASP/PHP comment instead of HTML/JavaScript comment which can be seen by client browsers.

### Reference


* [ https://tools.ietf.org/html/rfc1918 ](https://tools.ietf.org/html/rfc1918)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ X-Content-Type-Options Header Missing ](https://www.zaproxy.org/docs/alerts/10021/)



##### Faible (Moyen)

### Description

The Anti-MIME-Sniffing header X-Content-Type-Options was not set to 'nosniff'. This allows older versions of Internet Explorer and Chrome to perform MIME-sniffing on the response body, potentially causing the response body to be interpreted and displayed as a content type other than the declared content type. Current (early 2014) and legacy versions of Firefox will use the declared content type (if one is set), rather than performing MIME-sniffing.

* URL: https://pointage-front.vercel.app/_nuxt/ad.B18i8NGa.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ad.Blhdm5jl.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/af.Bc2fqp73.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/af.C77Rf6cE.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/arab.C-KgnQEz.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/arab.C4CYPgyC.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/as.BTEVCXG-.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/as.Dekqy8Of.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/aw.CLCX8uk5.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/aw.W0PWLK5p.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bm.BeYgB2z9.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bm.DvNWWcPM.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bn.B6T3O78g.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bn.CPQcA8Ol.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bo.CcUiMqkJ.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bo.Dry0C6UA.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/br.Cu5YU29T.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/br.Dr5rMAMb.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/Br6EKXX7.js

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bt.BTo4qm10.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bt.SxWnbWW0.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/builds/meta/646009bf-06a2-4ad4-acd5-a05052b170df.json

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bz.BCKHR4_q.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/bz.CoBdB-p8.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/CaO_N1Km.js

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/Ce44rwk6.js

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/cy.bZuP8hmf.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/cy.DJKnEFYW.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/dg.CJPJrjiZ.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/dg.DqkWLbnk.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/dm.Cbhezfe1.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/dm.DPPHwW2M.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/do.B86d445t.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/do.DeRnbj4d.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/eac.CwGQsyAM.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/eac.h4QKADRE.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ec.CaVOFQ3t.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ec.cwfBJlvF.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/eg.DwOkwyQ0.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/eg.YC70hswZ.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/entry.DWxhBv24.css

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/es-ga.D9xG2hYr.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/es-ga.DXhVZ333.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/es.BuSGTZm_.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/es.d5m8M5h8.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/fj.DEAVMg38.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/fj.u3dAPoew.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/fk.B-RvQ4Hz.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/fk.nuUF_Ak3.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-nir.D4gikpNq.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-nir.vEp1ZXy6.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-wls.Bxz9hxvX.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-wls.CK0XlKT-.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gq.Cag8QTk2.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gq.CPnMO1hT.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gs.DiiNa0F5.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gs.DOgYbHsY.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gt.BLpn5qMn.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gt.CJo5DI-7.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gu.Di1JYREk.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/gu.SbvrH0uZ.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/hr.BpiVVBoV.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/hr.fzLfaANM.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ht.DIMg4gti.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ht.pweRl6ZP.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/im.-VPIqfkF.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/im.Dd9p-0-T.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/io.13HOfeJD.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/io.BImhNBcd.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ir.cCIgaNf6.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ir.Q03Mij62.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/je.DyWbhIiC.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/je.vXe0Dr49.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/kg.B0FsxZiL.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/kg.CjfitMyT.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/kh.BBvObpUS.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/kh.BeWfuE30.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ki.fuIMkEYQ.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ki.p_fAQGbS.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ky.BqaZHuhf.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ky.Dpsu1myA.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/kz.CwKXYZ8s.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/kz.Dkyx6q-p.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/li.CHdhvNcr.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/li.CMlf0YU8.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/lk.DSQoDxn_.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/lk.DUkgV9Tq.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/md.DRlxvNwm.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/md.DTi94M3M.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/me.CfGorN3b.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/me.Cv4Gwqah.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/mp.CrOApEqW.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/mp.CuaQmCLf.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ms.B-w7hFKu.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ms.DxciGbUu.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/mt.YDa8zgzO.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/mt.YqzKx9xl.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/mx.Cc8Ccfe8.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/mx.CvCwYHGF.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/nf.DGrQb42O.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/nf.Dl00mlk2.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ni.BX2WCaNt.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/ni.CcFCSQxm.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/om.DcqxRdQL.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/om.nN8zP2Bu.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/pn.BPAlH32D.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/pn.DgxdtieE.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/primeicons.Dr5RGzOO.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/pt.BTevY6N2.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/pt.DZ2ADgIR.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/py.BKi5dxWt.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/py.mNzh0mZC.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/rs.BfwKwXtn.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/rs.CnTO3ehk.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sa.Dh79zbT9.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sa.DnlyVVKx.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.D-aE2xRW.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.FjwY7RYr.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-hl.CgxUDvtv.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-hl.CqtQPzWZ.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ta.BFo5zkKU.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ta.CPJublpi.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sm.BKrUHzrq.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sm.DGBIRFB_.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sv.CJIHhYwF.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sv.RZ39q5hO.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sx.nDhIaDNb.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sx.RKKs0ph6.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sz.D39eIL5d.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/sz.qxMwa2gs.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/tc.CJHJmJj1.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/tc.dtelpZmc.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/tm.C_WSgUcv.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/tm.DGBJvQay.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/un.Bqg4Cbbh.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/un.DabL4p35.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/va.B9-hqIE-.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/va.s7kyhqIM.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/vg.C7xY6pic.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/vg.ClZ-0KpG.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/vi.BC_zcciE.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/vi.BSdsyIxY.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/xk.Bj15g7cp.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/xk.Cdz2uTvR.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/zm.BmsW91ne.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/zm.D8B-0kdx.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/zw.CSuuaw9K.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`
* URL: https://pointage-front.vercel.app/_nuxt/zw.U0m7oJ5e.svg

  * Méthode: `GET`
  * Parameter: `x-content-type-options`
  * Attaquer: ``
  * Evidence: ``
  * Other Info: `This issue still applies to error type pages (401, 403, 500, etc.) as those pages are often still affected by injection issues, in which case there is still concern for browsers sniffing pages away from their actual content type.
At "High" threshold this scan rule will not alert on client or server error responses.`


Instances: 148

### Solution

Ensure that the application/web server sets the Content-Type header appropriately, and that it sets the X-Content-Type-Options header to 'nosniff' for all web pages.
If possible, ensure that the end user uses a standards-compliant and modern web browser that does not perform MIME-sniffing at all, or that can be directed by the web application/web server to not perform MIME-sniffing.

### Reference


* [ https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85) ](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/gg622941(v=vs.85))
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)


#### CWE Id: [ 693 ](https://cwe.mitre.org/data/definitions/693.html)


#### WASC Id: 15

#### Source ID: 3

### [ Information Disclosure - Suspicious Comments ](https://www.zaproxy.org/docs/alerts/10027/)



##### Pour information (Faible)

### Description

The response appears to contain suspicious comments which may help an attacker.

* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `select`
  * Other Info: `The following pattern was used: \bSELECT\b and was detected in likely comment: "//pointage-back.onrender.com",primevue:{usePrimeVue:true,autoImport:true,resolvePath:"",importPT:"",importTheme:"",loadStyles:tr", see evidence field for the suspicious comment/snippet.`
* URL: https://pointage-front.vercel.app/

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `select`
  * Other Info: `The following pattern was used: \bSELECT\b and was detected in likely comment: "//pointage-back.onrender.com",primevue:{usePrimeVue:true,autoImport:true,resolvePath:"",importPT:"",importTheme:"",loadStyles:tr", see evidence field for the suspicious comment/snippet.`
* URL: https://pointage-front.vercel.app/_nuxt/Br6EKXX7.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `query`
  * Other Info: `The following pattern was used: \bQUERY\b and was detected in likely comment: "//www.w3.org/2000/svg",my="http://www.w3.org/1998/Math/MathML",Pi=typeof document<"u"?document:null,qu=Pi&&Pi.createElement("tem", see evidence field for the suspicious comment/snippet.`
* URL: https://pointage-front.vercel.app/sitemap.xml

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `select`
  * Other Info: `The following pattern was used: \bSELECT\b and was detected in likely comment: "//pointage-back.onrender.com",primevue:{usePrimeVue:true,autoImport:true,resolvePath:"",importPT:"",importTheme:"",loadStyles:tr", see evidence field for the suspicious comment/snippet.`


Instances: 4

### Solution

Remove all comments that return information that may help an attacker and fix any underlying problems they refer to.

### Reference



#### CWE Id: [ 615 ](https://cwe.mitre.org/data/definitions/615.html)


#### WASC Id: 13

#### Source ID: 3

### [ Modern Web Application ](https://www.zaproxy.org/docs/alerts/10109/)



##### Pour information (Moyen)

### Description

The application appears to be a modern web application. If you need to explore it automatically then the Ajax Spider may well be more effective than the standard one.

* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `<script nonce="42wx2Nizr+07x4+Qh3dEp4og" integrity="sha384-SoPfNwIz4w4vrhBwfiY4w0ci4/+VoOvPWT+7zcxSX1uZrZRDLswXNW22AyeFfJyJ" type="module" src="/_nuxt/Br6EKXX7.js" crossorigin></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `<script nonce="s5PDP8uXQCNSmJp6BZVSrj/P" integrity="sha384-SoPfNwIz4w4vrhBwfiY4w0ci4/+VoOvPWT+7zcxSX1uZrZRDLswXNW22AyeFfJyJ" type="module" src="/_nuxt/Br6EKXX7.js" crossorigin></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: https://pointage-front.vercel.app/

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `<script nonce="Xftj6hZ7ehaFSzTqQvRSfgBF" integrity="sha384-SoPfNwIz4w4vrhBwfiY4w0ci4/+VoOvPWT+7zcxSX1uZrZRDLswXNW22AyeFfJyJ" type="module" src="/_nuxt/Br6EKXX7.js" crossorigin></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`
* URL: https://pointage-front.vercel.app/sitemap.xml

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `<script nonce="Xr45BWjyoWcmC+p3Cis6lYJB" integrity="sha384-SoPfNwIz4w4vrhBwfiY4w0ci4/+VoOvPWT+7zcxSX1uZrZRDLswXNW22AyeFfJyJ" type="module" src="/_nuxt/Br6EKXX7.js" crossorigin></script>`
  * Other Info: `No links have been found while there are scripts, which is an indication that this is a modern web application.`


Instances: 4

### Solution

This is an informational alert and so no changes are required.

### Reference




#### Source ID: 3

### [ Re-examine Cache-control Directives ](https://www.zaproxy.org/docs/alerts/10015/)



##### Pour information (Faible)

### Description

The cache-control header has not been set properly or is missing, allowing the browser and proxies to cache content. For static assets like css, js, or image files this might be intended, however, the resources should be reviewed to ensure that no sensitive content will be cached.

* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: `cache-control`
  * Attaquer: ``
  * Evidence: `public, max-age=0, must-revalidate`
  * Other Info: ``
* URL: https://pointage-front.vercel.app/

  * Méthode: `GET`
  * Parameter: `cache-control`
  * Attaquer: ``
  * Evidence: `public, max-age=0, must-revalidate`
  * Other Info: ``
* URL: https://pointage-front.vercel.app/_nuxt/builds/meta/646009bf-06a2-4ad4-acd5-a05052b170df.json

  * Méthode: `GET`
  * Parameter: `cache-control`
  * Attaquer: ``
  * Evidence: `public, max-age=31536000, immutable`
  * Other Info: ``
* URL: https://pointage-front.vercel.app/robots.txt

  * Méthode: `GET`
  * Parameter: `cache-control`
  * Attaquer: ``
  * Evidence: `public, max-age=0, must-revalidate`
  * Other Info: ``


Instances: 4

### Solution

For secure content, ensure the cache-control HTTP header is set with "no-cache, no-store, must-revalidate". If an asset should be cached consider setting the directives "public, max-age, immutable".

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching ](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#web-content-caching)
* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
* [ https://grayduck.mn/2021/09/13/cache-control-recommendations/ ](https://grayduck.mn/2021/09/13/cache-control-recommendations/)


#### CWE Id: [ 525 ](https://cwe.mitre.org/data/definitions/525.html)


#### WASC Id: 13

#### Source ID: 3

### [ Retrieved from Cache ](https://www.zaproxy.org/docs/alerts/10050/)



##### Pour information (Moyen)

### Description

The content was retrieved from a shared cache. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: https://pointage-front.vercel.app

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ad.B18i8NGa.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ad.Blhdm5jl.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/af.Bc2fqp73.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/af.C77Rf6cE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/arab.C-KgnQEz.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/arab.C4CYPgyC.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/as.BTEVCXG-.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/as.Dekqy8Of.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/aw.CLCX8uk5.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/aw.W0PWLK5p.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bm.BeYgB2z9.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bm.DvNWWcPM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bn.B6T3O78g.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bn.CPQcA8Ol.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bo.CcUiMqkJ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bo.Dry0C6UA.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/br.Cu5YU29T.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/br.Dr5rMAMb.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/Br6EKXX7.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/Br6EKXX7.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 1411`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bt.BTo4qm10.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bt.SxWnbWW0.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/builds/meta/646009bf-06a2-4ad4-acd5-a05052b170df.json

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 1514`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/builds/meta/646009bf-06a2-4ad4-acd5-a05052b170df.json

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 96`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bz.BCKHR4_q.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/bz.CoBdB-p8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/CaO_N1Km.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/CaO_N1Km.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 1397`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/Ce44rwk6.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/Ce44rwk6.js

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 1398`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/cy.bZuP8hmf.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/cy.DJKnEFYW.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/dg.CJPJrjiZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/dg.DqkWLbnk.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/dm.Cbhezfe1.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/dm.DPPHwW2M.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/do.B86d445t.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/do.DeRnbj4d.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/eac.CwGQsyAM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/eac.h4QKADRE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ec.CaVOFQ3t.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ec.cwfBJlvF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/eg.DwOkwyQ0.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/eg.YC70hswZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/entry.DWxhBv24.css

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/entry.DWxhBv24.css

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 1411`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/es-ga.D9xG2hYr.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/es-ga.DXhVZ333.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/es.BuSGTZm_.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/es.d5m8M5h8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/fj.DEAVMg38.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/fj.u3dAPoew.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/fk.B-RvQ4Hz.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/fk.nuUF_Ak3.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-nir.D4gikpNq.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-nir.vEp1ZXy6.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-wls.Bxz9hxvX.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gb-wls.CK0XlKT-.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gq.Cag8QTk2.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gq.CPnMO1hT.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gs.DiiNa0F5.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gs.DOgYbHsY.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gt.BLpn5qMn.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gt.CJo5DI-7.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gu.Di1JYREk.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/gu.SbvrH0uZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/hr.BpiVVBoV.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/hr.fzLfaANM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ht.DIMg4gti.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ht.pweRl6ZP.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/im.-VPIqfkF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/im.Dd9p-0-T.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/io.13HOfeJD.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/io.BImhNBcd.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ir.cCIgaNf6.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ir.Q03Mij62.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/je.DyWbhIiC.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/je.vXe0Dr49.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/kg.B0FsxZiL.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/kg.CjfitMyT.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/kh.BBvObpUS.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/kh.BeWfuE30.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ki.fuIMkEYQ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ki.p_fAQGbS.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ky.BqaZHuhf.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ky.Dpsu1myA.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/kz.CwKXYZ8s.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/kz.Dkyx6q-p.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/li.CHdhvNcr.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/li.CMlf0YU8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/lk.DSQoDxn_.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/lk.DUkgV9Tq.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/md.DRlxvNwm.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/md.DTi94M3M.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/me.CfGorN3b.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/me.Cv4Gwqah.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/mp.CrOApEqW.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/mp.CuaQmCLf.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ms.B-w7hFKu.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ms.DxciGbUu.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/mt.YDa8zgzO.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/mt.YqzKx9xl.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/mx.Cc8Ccfe8.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/mx.CvCwYHGF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/nf.DGrQb42O.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/nf.Dl00mlk2.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ni.BX2WCaNt.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/ni.CcFCSQxm.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/om.DcqxRdQL.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/om.nN8zP2Bu.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/pn.BPAlH32D.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/pn.DgxdtieE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/primeicons.Dr5RGzOO.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/pt.BTevY6N2.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/pt.DZ2ADgIR.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/py.BKi5dxWt.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/py.mNzh0mZC.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/rs.BfwKwXtn.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/rs.CnTO3ehk.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sa.Dh79zbT9.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sa.DnlyVVKx.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.D-aE2xRW.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ac.FjwY7RYr.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-hl.CgxUDvtv.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-hl.CqtQPzWZ.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ta.BFo5zkKU.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sh-ta.CPJublpi.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sm.BKrUHzrq.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sm.DGBIRFB_.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sv.CJIHhYwF.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sv.RZ39q5hO.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sx.nDhIaDNb.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sx.RKKs0ph6.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sz.D39eIL5d.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/sz.qxMwa2gs.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/tc.CJHJmJj1.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/tc.dtelpZmc.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/tm.C_WSgUcv.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/tm.DGBJvQay.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/un.Bqg4Cbbh.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/un.DabL4p35.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/va.B9-hqIE-.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/va.s7kyhqIM.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/vg.C7xY6pic.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/vg.ClZ-0KpG.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/vi.BC_zcciE.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/vi.BSdsyIxY.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/xk.Bj15g7cp.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/xk.Cdz2uTvR.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/zm.BmsW91ne.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/zm.D8B-0kdx.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/zw.CSuuaw9K.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/_nuxt/zw.U0m7oJ5e.svg

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/assets/image/logo.png

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 110`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/robots.txt

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`
* URL: https://pointage-front.vercel.app/sitemap.xml

  * Méthode: `GET`
  * Parameter: ``
  * Attaquer: ``
  * Evidence: `Age: 0`
  * Other Info: `The presence of the 'Age' header indicates that a HTTP/1.1 compliant caching server is in use.`


Instances: 158

### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://tools.ietf.org/html/rfc7234 ](https://tools.ietf.org/html/rfc7234)
* [ https://tools.ietf.org/html/rfc7231 ](https://tools.ietf.org/html/rfc7231)
* [ https://www.rfc-editor.org/rfc/rfc9110.html ](https://www.rfc-editor.org/rfc/rfc9110.html)



#### Source ID: 3


