import React, { memo } from 'react';
import RenderHTML, { CustomRendererProps, Element, TNode } from 'react-native-render-html';
import styles from './postHtmlRendererStyles';
import { LinkData, parseLinkData } from './linkDataParser';
import VideoThumb from './videoThumb';
import { AutoHeightImage } from '../autoHeightImage/autoHeightImage';
import { useHtmlIframeProps, iframeModel } from '@native-html/iframe-plugin';
import WebView from 'react-native-webview';
import { VideoPlayer } from '..';
import { useHtmlTableProps } from '@native-html/table-plugin';
import { ScrollView } from 'react-native-gesture-handler';
import { prependChild, removeElement } from 'htmlparser2/node_modules/domutils';

interface PostHtmlRendererProps {
  contentWidth: number;
  body: string;
  isComment?: boolean;
  onLoaded?: () => void;
  setSelectedImage: (imgUrl: string) => void;
  setSelectedLink: (url: string) => void;
  onElementIsImage: (imgUrl: string) => void;
  handleOnPostPress: (permlink: string, authro: string) => void;
  handleOnUserPress: (username: string) => void;
  handleTagPress: (tag: string, filter?: string) => void;
  handleVideoPress: (videoUrl: string) => void;
  handleYoutubePress: (videoId: string, startTime: number) => void;
}

export const PostHtmlRenderer = memo(
  ({
    contentWidth,
    body,
    isComment,
    onLoaded,
    setSelectedImage,
    setSelectedLink,
    onElementIsImage,
    handleOnPostPress,
    handleOnUserPress,
    handleTagPress,
    handleVideoPress,
    handleYoutubePress,
  }: PostHtmlRendererProps) => {
    //new renderer functions
    body = body.replace(/<center>/g, '<div class="text-center">').replace(/<\/center>/g, '</div>');

    body = `<p><a target="_blank"></a></p>
    <div class="pull-right"><span><img class="markdown-img-link" src="https://images.ecency.com/p/x7L2VSNEiyAB5Ux7nxKmLo6yLyEJT6Jt5yhNCUpGMjyD3eak11KtYj95t4PMa6dVzdCX4o136yUGF65.png?format=match&amp;mode=fit" /></span><br />
    <sup>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Source: <a target="_blank" class="markdown-external-link" data-href="https://pixabay.com/de/users/eroc1999-194504/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=661991">Eric Chandler</a> </sup>
    </div>
    <h1>Anchor - Anker - Ancla</h1>
    <p><b>
    ° How to use anchor in your Hive posts<br />
    ° Wie man Anker in Hive Posts benutzt<br />
    ° Cómo usar ancla en tus publicaciones de Hive
    </b></p>
    <p><div class="text-center"><sup><br />
    <a target="_blank" target="_self" class="markdown-external-link" data-href="#english">English</a> ° <a target="_blank" target="_self" class="markdown-external-link" data-href="#deutsch">Deutsch</a> ° <a target="_blank" target="_self" class="markdown-external-link" data-href="#espanol">Español</a><br />
    </sup></div><br />
    <a target="_blank" data-id="english"></a></p>
    <h2>Hello fellow Hivians</h2>
    <p>Surely you have already thought about how the reader can jump to a certain point in the text. This is a big topic, especially for bloggers who write multilingually. I've often seen that some work with two columns or jump back and forth between languages ​​in the text.<br />
    <em>What if you had great jump marks in your text like I used here?</em><br />
    The reader could switch from language to language. Or you have a table of contents and the reader can jump directly to a topic.</p>
    <h2>So let's drop anchor</h2>
    <p>If you've already dealt with HTML, it should be relatively easy for you. For the others, here is a little guide on how it works.</p>
    <p>In order for the whole thing to work you need two code snippets. Once the link to the anchor that you can click and once the anchor itself where you then jump to.</p>
    <h4>Your anchor looks like this:</h4>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"anchor"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>You can name your anchor whatever you want, but of course you must use the same name in the link and add a hash in front. The target part is important to jump within the post and not open a new window.</p>
    <h4>Your link looks like this:</h4>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#anchor"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">anchor</span><span class="ll-spc"> </span><span class="ll-nam">link</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>In this post here it looks like this for the language selection on the left:</p>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">center</span><span class="ll-pct">&gt;</span><span class="ll-spc">
      </span><span class="ll-pct">&lt;</span><span class="ll-nam">up</span><span class="ll-pct">&gt;</span><span class="ll-spc">
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#english"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">English</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc"> </span><span class="ll-unk">°</span><span class="ll-spc">
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#deutsch"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">Deutsch</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc"> </span><span class="ll-unk">°</span><span class="ll-spc">
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#espanol"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">Espa</span><span class="ll-unk">ñ</span><span class="ll-nam">ol</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
       </span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">up</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">center</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>And here are all the anchors, of course placed in the right places in the text:</p>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"english"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"deutsch"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"espanol"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>I hope I could help you with that. If you have any questions, ask them in the comments.<br />
    <a target="_blank" data-id="deutsch"></a></p>
    <hr />
    <div class="text-center"><sup>
    <a target="_blank" target="_self" class="markdown-external-link" data-href="#english">English</a> ° <a target="_blank" target="_self" class="markdown-external-link" data-href="#deutsch">Deutsch</a> ° <a target="_blank" target="_self" class="markdown-external-link" data-href="#espanol">Español</a>
    </sup></div>
    <h2>Hallo liebe Hivianer</h2>
    <p>Sicher habt ihr auch schon mal überlegt wie der Leser zu einem bestimmten Punkt im Text springen kann. Gerade für Blogger die multilingual schreiben, ist das ein großes Thema. Ich hab oft gesehen das einige mit zwei Spalten arbeiten oder im Text hin und her springen zwischen den Sprachen.<br />
    <em>Was wäre wenn du in deinem Text so tolle Sprungmarken hättest wie ich es hier benutzt habe?</em><br />
    Der Leser könnte von Sprache zu Sprache wechseln. Oder du hast ein Inhaltsverzeichnis und der Leser kann direkt zu einem Thema springen.</p>
    <h2>Also lasst uns den Anker werfen</h2>
    <p>Falls du schon mit HTML zu tun hattest, dürfte es relativ einfach für dich sein. Für die anderen ist hier eine kleine Anleitung wie es funktioniert.</p>
    <p>Damit das ganze funktioniert brauchst du zwei Code Schnipsel. Einmal den Link zu dem Anker, den man klicken kann und einmal den Anker selbst wo man dann hin springt.</p>
    <h4>Dein Anker sieht so aus:</h4>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"anker"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>Du kannst deinen Anker benennen wie du willst, aber du musst natürlich im Link den gleichen Namen benutzen und eine Raute vorne hinzufügen. Der Target Teil is wichtig, damit innerhalb des Posts gesprungen wird und nicht ein neues Fenster geöffnet wird.</p>
    <h4>Dein Link sieht so aus:</h4>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#anker"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">Anker</span><span class="ll-spc"> </span><span class="ll-nam">Link</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>In diesem Post hier sieht das so für die Sprachauswahl Links aus:</p>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">center</span><span class="ll-pct">&gt;</span><span class="ll-spc">
      </span><span class="ll-pct">&lt;</span><span class="ll-nam">sup</span><span class="ll-pct">&gt;</span><span class="ll-spc">
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#english"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">English</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc"> </span><span class="ll-unk">°</span><span class="ll-spc"> 
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#deutsch"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">Deutsch</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc"> </span><span class="ll-unk">°</span><span class="ll-spc"> 
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#espanol"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">Espa</span><span class="ll-unk">ñ</span><span class="ll-nam">ol</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
       </span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">sup</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">center</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>Und hier sind alle Anker die natürlich an den richtigen Stellen im Text plaziert sind:</p>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"english"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"deutsch"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"espanol"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>Ich hoffe ich konnte euch damit helfen. Falls ihr fragen habt, stellt sie in den Kommentaren.</p>
    <p><a target="_blank" data-id="espanol"></a></p>
    <hr />
    <div class="text-center"><sup>
    <a target="_blank" target="_self" class="markdown-external-link" data-href="#english">English</a> ° <a target="_blank" target="_self" class="markdown-external-link" data-href="#deutsch">Deutsch</a> ° <a target="_blank" target="_self" class="markdown-external-link" data-href="#espanol">Español</a>
    </sup></div>
    <h2>Hola compañeros Hivianos</h2>
    <p>Seguro que ya has pensado en cómo el lector puede saltar a un punto determinado del texto. Este es un gran tema, especialmente para los blogueros que escriben en varios idiomas. Muchas veces he visto que algunos trabajan con dos columnas o saltan de un idioma a otro en el texto.<br />
    <em>¿Qué pasaría si tuviera grandes marcas de salto en su texto como las que usé aquí?</em><br />
    El lector podía cambiar de idioma a idioma. O tiene una tabla de contenido y el lector puede saltar directamente a un tema.</p>
    <h2>Así que echemos el ancla</h2>
    <p>Si ya ha trabajado con HTML, debería ser relativamente fácil para usted. Para los demás, aquí hay una pequeña guía sobre cómo funciona.</p>
    <p>Para que todo funcione, necesita dos fragmentos de código. Una vez que el enlace al ancla en el que puede hacer clic y una vez que el ancla misma donde luego salta.</p>
    <h4>Tu ancla se ve así:</h4>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"ancla"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>Puede nombrar su ancla como desee, pero, por supuesto, debe usar el mismo nombre en el enlace y agregar un hash al frente. La parte de destino es importante para saltar dentro de la publicación y no abrir una nueva ventana.</p>
    <h4>Su enlace se ve así:</h4>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#ancla"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">enlace</span><span class="ll-spc"> </span><span class="ll-nam">de</span><span class="ll-spc"> </span><span class="ll-nam">anclaje</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>En esta publicación aquí se ve así para la selección de idioma a la izquierda:</p>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">center</span><span class="ll-pct">&gt;</span><span class="ll-spc">
      </span><span class="ll-pct">&lt;</span><span class="ll-nam">sup</span><span class="ll-pct">&gt;</span><span class="ll-spc">
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#english"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">English</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc"> </span><span class="ll-unk">°</span><span class="ll-spc">
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#deutsch"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">Deutsch</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc"> </span><span class="ll-unk">°</span><span class="ll-spc">
         </span><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">href</span><span class="ll-pct">=</span><span class="ll-str">"#espanol"</span><span class="ll-spc"> </span><span class="ll-nam">target</span><span class="ll-pct">=</span><span class="ll-str">"_self"</span><span class="ll-pct">&gt;</span><span class="ll-nam">Espa</span><span class="ll-unk">ñ</span><span class="ll-nam">ol</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
       </span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">sup</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">center</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>Y aquí están todos los anclajes, por supuesto colocados en los lugares correctos del texto:</p>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"english"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"deutsch"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <pre><code><span class="ll-pct">&lt;</span><span class="ll-nam">a</span><span class="ll-spc"> </span><span class="ll-nam">id</span><span class="ll-pct">=</span><span class="ll-str">"espanol"</span><span class="ll-pct">&gt;</span><span class="ll-pct">&lt;</span><span class="ll-pct">/</span><span class="ll-nam">a</span><span class="ll-pct">&gt;</span><span class="ll-spc">
    </span></code></pre>
    <p>Espero poder ayudarte con eso. Si tienes alguna duda, hazla en los comentarios.<br />
    <div class="text-center"><sup><a target="_blank" target="_self" class="markdown-external-link" data-href="#top">Top</a></sup></div><br />
    I used Google Translator - Please let me know if there are any misspells.<br />
    <div class="text-center"><br />
    <img src="https://images.ecency.com/p/2bP4pJr4wVimqCWjYimXJe2cnCgnJ5LEmFqP8oMHotZ.png?format=match&amp;mode=fit" alt="chaosmagic23" /><br />
    <a target="_blank" class="markdown-external-link" data-href="https://buymeberries.com/@chaosmagic23"><img src="https://images.ecency.com/0x0/https://buymeberries.com/assets/bmb-4-l.png" alt="Support chaosmagic23 on buymeberries" /></a><br />
    <a target="_blank" class="markdown-external-link" data-href="https://ecency.com/signup?referral=chaosmagic23"><img src="https://images.ecency.com/p/x7L2VSNEiyAB5Ux7nxKmLo6yLyEJT6Jt5yhNCUpGMjRb31xGfQZ65c8NvLYTfV5EFMQVPGVfQvfMPkq.png?format=match&amp;mode=fit" alt="Posted using Ecency Love" /></a><br />
    </div><br />
    <em>Images and screenshots are from me or free pixabay pictures</em></p>
    <p><span><a target="_blank" class="markdown-tag-link" data-tag="oneup">#oneup</a> <a target="_blank" class="markdown-tag-link" data-tag="pizza">#pizza</a> <a target="_blank" class="markdown-tag-link" data-tag="hive-engine">#hive-engine</a> <a target="_blank" class="markdown-tag-link" data-tag="neoxian">#neoxian</a> <a target="_blank" class="markdown-tag-link" data-tag="ocd">#ocd</a> <a target="_blank" class="markdown-tag-link" data-tag="pob">#pob</a> <a target="_blank" class="markdown-tag-link" data-tag="pgm">#pgm</a> <a target="_blank" class="markdown-tag-link" data-tag="alive">#alive</a> <a target="_blank" class="markdown-tag-link" data-tag="posh">#posh</a></span></p>
    <hr />
    <table>
    <tr>
    <th>Crypto  Games</th>
    <th>Crypto</th>
    <th>Trading</th>
    <th>Marketing</th>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://godsunchained.com/account/register?referral=TKCDjJVkND">Gods Unchained</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://cb.run/ZGiI">Free BitCoin</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://www.tradingview.com/gopro/?share_your_love=Chaos23">Pro Chart Tradingtool</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://listnerds.com/@chaos23">ListNerds</a></td>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://splinterlands.com?ref=chaos23">Splinterlands</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://bitcoinaliens.com/?ref=4635905&amp;game=8&amp;pf=2">Free LiteCoin</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://cb.run/Binance20">Binance Trading &amp; Earning</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://leadsleap.com/?r=chaosmagic23">LeadsLeap</a></td>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://grandland.prospectors.io?waxref=dxdr2.wam">Prospectors</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://cb.run/1fdp">Cointiply</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://www.kucoin.com/ucenter/signup?rcode=rJM7SKX">Kucoin Trading</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://trafficadbar.com/chaosmagic23">Traffic Ad Bar</a></td>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://www.risingstargame.com?referrer=chaosmagic23">Rising Stars</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://cb.run/Sbpv">Geomining</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://stakely.io/staking-dashboard?coin=Terra&amp;ref=9ff6ee">Terra LUNA staking</a></td>
    <td></td>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://www.direwolfdigital.com/eternal/register/?ref=ea0901f4-271e-4340-aba0-879b6178bbd3">Eternal</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://cb.run/hSO2">Pi Network</a></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://www.cryptohopper.com/?atid=19446">Bot Trading</a></td>
    <td></td>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://womplay.io/?ref=LZQGUBV">Womplay</a></td>
    <td></td>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://www.plus500.com/de/refer-friend?rut=h8PD43j-9dcCVPPfHr_f26qKbwTFAgYlzETyJS3EkbiRYHzZmGtD4XizaMeHXaP5yskq0UJXwjk7547iOgoKlzASaDdCwH40Mr37u5z_Fnw1">CFD Trading</a></td>
    <td></td>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://pipeflare.io/r/asjf">Pipeflare</a></td>
    <td></td>
    <td></td>
    <td></td>
    </tr>
    <tr>
    <td><a target="_blank" target="_blank" class="markdown-external-link" data-href="https://betfury.io/?r=5faaa9b6132340b06fa0b5ca">BetFury</a></td>
    <td></td>
    <td></td>
    <td></td>
    </tr>
    </table>`
    
    console.log('Comment body:', body);



    const _minTableColWidth = (contentWidth / 3) - 12;

    const _handleOnLinkPress = (data: LinkData) => {
      if (!data) {
        return;
      }

      const {
        type,
        href,
        author,
        permlink,
        tag,
        youtubeId,
        startTime,
        filter,
        videoHref,
        community,
      } = data;

      try {
        switch (type) {
          case '_external':
          case 'markdown-external-link':
            setSelectedLink(href);
            break;
          case 'markdown-author-link':
            if (handleOnUserPress) {
              handleOnUserPress(author);
            }
            break;
          case 'markdown-post-link':
            if (handleOnPostPress) {
              handleOnPostPress(permlink, author);
            }
            break;
          case 'markdown-tag-link':
            if (handleTagPress) {
              handleTagPress(tag, filter);
            }
            break;

          case 'markdown-video-link':
            if (handleVideoPress) {
              handleVideoPress(videoHref);
            }
            break;
          case 'markdown-video-link-youtube':
            if (handleYoutubePress) {
              handleYoutubePress(youtubeId, startTime);
            }

            break;

          //unused cases
          case 'markdown-witnesses-link':
            setSelectedLink(href);
            break;

          case 'markdown-proposal-link':
            setSelectedLink(href);
            break;

          case 'markdown-community-link':
            //tag press also handles community by default
            if (handleTagPress) {
              handleTagPress(community, filter);
            }
            break;

          default:
            break;
        }
      } catch (error) { }
    };


    //this method checks if image is a child of table column
    //and calculates img width accordingly,
    //returns full width if img is not part of table
    const getMaxImageWidth = (tnode: TNode) => {
      //return full width if not parent exist
      if (!tnode.parent || tnode.parent.tagName === 'body') {
        return contentWidth;
      }

      //return divided width based on number td tags
      if (tnode.parent.tagName === 'td' || tnode.parent.tagName === 'th') {
        const cols = tnode.parent.parent.children.length;
        return contentWidth / cols;
      }

      //check next parent
      return getMaxImageWidth(tnode.parent);
    };



    //Does some needed dom modifications for proper rendering
    const _onElement = (element: Element) => {
      if (element.tagName === 'img' && element.attribs.src) {
        const imgUrl = element.attribs.src;
        console.log('img element detected', imgUrl);
        onElementIsImage(imgUrl);
      }

      
      //this avoids invalid rendering of first element of table pushing rest of columsn to extreme right.
      if(element.tagName === 'table'){
        console.log('table detected')

        element.children.forEach((child)=>{
          if(child.name === 'tr'){
            let headerIndex = -1;
            let colIndex = -1;
            
            child.children.forEach((gChild, index) => {
              //check if element of row in table is not a column while it's other siblings are columns
              if(gChild.type === 'tag'){
                if(gChild.name !== 'td' && headerIndex === -1){
                  headerIndex = index;
                }else if(colIndex === -1){
                  colIndex = index
                }
              }
            })

            //if row contans a header with column siblings
            //remove first child and place it as first separate row in table
            if(headerIndex !== -1 && colIndex !== -1 && headerIndex < colIndex){
              console.log("time to do some switching", headerIndex, colIndex);
              const header = child.children[headerIndex];
              const headerRow = new Element('tr', {}, [header]);

              removeElement(header);
              prependChild(element, headerRow);
            }
          }
        })
      }
    };




    const _anchorRenderer = ({ InternalRenderer, tnode, ...props }: CustomRendererProps<TNode>) => {
      const parsedTnode = parseLinkData(tnode);
      const _onPress = () => {
        console.log('Link Pressed:', tnode);
        const data = parseLinkData(tnode);
        _handleOnLinkPress(data);

        //TODO: if local anchor is pressed "#english" try to find element position using id
      };


      //process video link
      if (tnode.classes?.indexOf('markdown-video-link') >= 0) {

        if (isComment) {
          const imgElement = tnode.children.find((child) => {
            return child.classes.indexOf('video-thumbnail') > 0 ? true : false;
          });
          if (!imgElement) {
            return <VideoThumb contentWidth={contentWidth} onPress={_onPress} />;
          }
        } else {
          return (
            <VideoPlayer
              mode={parsedTnode.youtubeId ? 'youtube' : 'uri'}
              contentWidth={contentWidth}
              uri={parsedTnode.videoHref}
              youtubeVideoId={parsedTnode.youtubeId}
              startTime={parsedTnode.startTime}
              disableAutoplay={true}
            />
          );
        }
      }

      if (tnode.children.length === 1 && tnode.children[0].tagName === 'img') {
        const maxImgWidth = getMaxImageWidth(tnode);
        return <AutoHeightImage
          contentWidth={maxImgWidth}
          imgUrl={tnode.children[0].attributes.src}
          isAnchored={false}
          activeOpacity={0.8}
          onPress={_onPress}
        />
      }

  
      return <InternalRenderer tnode={tnode} onPress={_onPress} {...props} />;
    };





    const _imageRenderer = ({ tnode }: CustomRendererProps<TNode>) => {
      const imgUrl = tnode.attributes.src;
      const _onPress = () => {
        console.log('Image Pressed:', imgUrl);
        setSelectedImage(imgUrl);
      };

      const isVideoThumb = tnode.classes?.indexOf('video-thumbnail') >= 0;
      const isAnchored = tnode.parent?.tagName === 'a';

      if (isVideoThumb) {
        return <VideoThumb contentWidth={contentWidth} uri={imgUrl} />;
      } else {
        const maxImgWidth = getMaxImageWidth(tnode);
        return (
          <AutoHeightImage
            contentWidth={maxImgWidth}
            imgUrl={imgUrl}
            isAnchored={isAnchored}
            onPress={_onPress}
          />
        );
      }
    };

    /**
     * the para renderer is designd to remove margins from para
     * if it's a direct child of li tag as the added margin causes
     * a weired misalignment of bullet and content
     * @returns Default Renderer
     */
    const _paraRenderer = ({ TDefaultRenderer, ...props }: CustomRendererProps<TNode>) => {
      props.style = props.tnode.parent.tagName === 'li' ? styles.pLi : styles.p;

      return <TDefaultRenderer {...props} />;
    };


    //based on number of columns a table have, sets scroll enabled or disable, also adjust table full width
    const _tableRenderer = ({ InternalRenderer, ...props }: CustomRendererProps<TNode>) => {
      // const tableProps = useHtmlTableProps(props);

      let maxColumns = 0;
      props.tnode.children.forEach((child)=>
        maxColumns = child.children.length > maxColumns ? child.children.length : maxColumns
      )

      const isScrollable = maxColumns > 3;
      const _tableWidth = isScrollable ? maxColumns * _minTableColWidth : contentWidth;
      props.style = { width: _tableWidth };

      return (
        <ScrollView horizontal={true} scrollEnabled={isScrollable}>
          <InternalRenderer {...props} />
        </ScrollView>
      )
    }


    // iframe renderer for rendering iframes in body
    const _iframeRenderer = function IframeRenderer(props) {
      const iframeProps = useHtmlIframeProps(props);

      if (isComment) {
        const _onPress = () => {
          console.log('iframe thumb Pressed:', iframeProps);
          if (handleVideoPress) {
            handleVideoPress(iframeProps.source.uri);
          }
        };
        return (
          <VideoThumb contentWidth={contentWidth} onPress={_onPress} />
        )
      } else {
        return (
          <VideoPlayer
            mode='uri'
            uri={iframeProps.source.uri}
            contentWidth={contentWidth}
          />
        );
      }

    };

    return (
      <RenderHTML
        source={{ html: body }}
        contentWidth={contentWidth}
        baseStyle={{ ...styles.baseStyle, width: contentWidth }}
        classesStyles={{
          phishy: styles.phishy,
          'text-justify': styles.textJustify,
          'text-center': styles.textCenter,
        }}
        tagsStyles={{
          body: styles.body,
          a: styles.a,
          img: styles.img,
          table: styles.table,
          tr: { ...styles.tr, width: contentWidth }, //center tag causes tr to have 0 width if not exclusivly set, contentWidth help avoid that
          th: { ...styles.th, minWidth: _minTableColWidth },
          td: { ...styles.td, minWidth: _minTableColWidth },
          div: { ...styles.div, maxWidth: contentWidth }, //makes sure width covers the available horizontal space for view and not exceed the contentWidth if parent bound id not defined
          blockquote: styles.blockquote,
          code: styles.code,
          li: styles.li,
          p: styles.p,
          h6: styles.h6
        }}
        domVisitors={{
          onElement: _onElement,
        }}
        renderers={{
          img: _imageRenderer,
          a: _anchorRenderer,
          p: _paraRenderer,
          iframe: _iframeRenderer,
          table: _tableRenderer
        }}
        onHTMLLoaded={onLoaded && onLoaded}
        defaultTextProps={{
          selectable: true,
        }}
        customHTMLElementModels={{
          iframe: iframeModel,
        }}
        renderersProps={{
          iframe: {
            scalesPageToFit: true,
            webViewProps: {
              /* Any prop you want to pass to iframe WebViews */
            },
          },
        }}
        WebView={WebView}
      />
    );
  },
  (next, prev) => next.body === prev.body,
);
