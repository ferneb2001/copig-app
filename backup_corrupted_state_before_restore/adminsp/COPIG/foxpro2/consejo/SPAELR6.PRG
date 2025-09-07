procedure spaelr6
*    Impresion de certificaciones emitidas (reimpresion)
*     archivo 96/97
set talk off
@04,01 clear to 23,78
close all
set printer to
set device to screen
set console on
set deleted on
fila=1
contador =0
set date to french
wcatego=space(2)
wmatri=0
wnom=space(30)
wfecha={  /  /  }
wkey=space(7)
wkey1=space(9)
select 2
use spmatri index spmatri
select 4
use spmatrie index spmatrie
select 5
use spcer96 index spcer6cm
wsigue = 's'
wcontinua = 's'
do while wsigue = 's'
   @04,01 clear to 23,78
   @04,24 say 'impresion del texto de certificacion'
   wcatego=space(2)
   wmatri=0
   wcerti=0
   wkeycer=space(14)
   wnom=space(30)
   wcomit=space(30)
   wlabor=space(23)
   wlabor1=space(69)
   wlabor2=space(69)
   wlabor3=space(69)
   wobra=space(40)
   wdomobr=space(40)
   wsupf=space(10)
   wplant=0
   wbocas=0
   wpotkw=space(10)
   wtitdesc=space(30)
   wtitu=space(3)
   wkmbtmt=0
   @07,01 clear to 18,78
   @19,01 clear to 23,78
   @07,15 say 'Matr¡cula  :'
   @07,35 say 'Categor¡a:'
   @09,15 say 'Certificado:'
   @23,04 say "Ingrese matr¡cula ¢ <esc> para salir"
   @07,28 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey() <> 27
      @23,04 say 'Indique categor¡a'
      @07,46 get wcatego pict '!!'
      read
      @23,01 clear to 23,78
      if lastkey() <> 27
         @23,04 say 'Ingrese n£mero de Certificado'
         @09,28 get wcerti pict '9999999'
         read
         @23,01 clear to 23,78
         if lastkey() <> 27
            wkeycer=str(wcerti,7)+str(wmatri,5)+wcatego
            select 5
            seek(wkeycer)
            if found()
               do buscatit
               select 5
               wnom=cenombre
               wcomit=cecomit
               wlabor=celabor
               wlabor1=celab1
               wlabor2=celab2
               wlabor3=celab3
               wobra=ceobra
               wdomobr=cedomob
               wsupf=cesupf
               wplant=ceplant
               wbocas=cebocas
               wpotkw=cepotkw
               wkmbtmt=cekmbmt
               wred=cered
               wimp=1
               @23,01 clear to 23,78
               @23,30 get wimp pict '@*H \<Salir;\<Imprimir' size 1,1
               read
               if wimp=2
                  do imprime
               endif   
            else
              @23,04 say 'No existe registro con estos datos'
              wop=0
              @23,77 get wop
            endif
         endif
      endif
   else
      wsigue='n'
   endif
enddo

procedure buscatit
wtitdesc=space(30)
select 2
wkey=str(wmatri,5)+wcatego
seek(wkey)
if found()
   wtitu=titulo
   select 6
   use sptitu order titulo
   seek(wtitu)
   if found()
      wtitdesc=titdesc
   endif
endif      
return

procedure imprime
wocup=0
wvece=0
do imprim1
wcontimp='S'
do while wcontimp='S'
   wimp=1
   @23,01 clear to 23,78
   @23,30 get wimp pict '@*H \<Salir;\<Imprimir de nuevo' size 1,1
   read
   @23,01 clear to 23,78
   if wimp=2
      do imprim1
   else
      wcontimp='N'
   endif
enddo
return

procedure imprim1
set console off
set printer on
set device to printer
set printer to "LPT1"
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ?
   ? 'EL CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS CERTIFICA'
   ? 'que el Profesional:'
   ?? rtrim(wnom)
      wocup=len(rtrim(wnom))
      wvece=30-wocup
   ?? replicate('*',wvece)
   ?? 'Matr¡cula:' at 50
   ?? wmatri pict '99999'
   ?? ' Cate-' at 64
   ?  'gor¡a:'
   ?? wcatego
   ?? 'T¡tulo:' at 9
   ?? rtrim(wtitdesc)
      wocup=len(rtrim(wtitdesc))
      wvece=30-wocup
   ?? replicate('*',wvece)
   ?? replicate('*',3)
   ?? ' est  habilitado para'
   ?  'realizar las siguientes labores profesionales:'
   ?? rtrim(wlabor)
      wocup=len(rtrim(wlabor))
      wvece=24-wocup
   ?? replicate('*',wvece)   
   ?  rtrim(wlabor1)
      wocup=len(rtrim(wlabor1))
      wvece=70-wocup
   ?? replicate('*',wvece)
   ?  rtrim(wlabor2)
      wocup=len(rtrim(wlabor2))
      wvece=70-wocup
   ?? replicate('*',wvece)
   ?  rtrim(wlabor3)
      wocup=len(rtrim(wlabor3))
      wvece=70-wocup
   ?? replicate('*',wvece)
   ?  'cuyo comitente es:'
   ?? rtrim(wcomit)
      wocup=len(rtrim(wcomit))
      wvece=30-wocup
   ?? replicate('*',wvece)
   ?? replicate('*',22)
   ?  'de la obra:'
   ?? rtrim(wobra)
      wocup=len(rtrim(wobra))
      wvece=40-wocup
   ?? replicate("*",wvece)
   ?? ' Sup:'
   ?? rtrim(wsupf)
      wocup=len(rtrim(wsupf))
      wvece=10-wocup
   ?? replicate('*',wvece)
   ?? '****'
   ?  'Sita en : '
   ?? rtrim(wdomobr)
      wocup=len(rtrim(wdomobr))
      wvece=60-wocup
   ?? replicate('*',wvece)
   ?  'Plantas:'
   ?? wplant pict '99'
   ?? ' Bocas:'
   ?? wbocas pict '99999'
   ?? ' Potencia:'
   ?? rtrim(wpotkw)
      wocup=len(rtrim(wpotkw))
      wvece=10-wocup
   ?? replicate('*',wvece)
   ?? ' Red:'
   ?? rtrim(wred)
      wocup=len(rtrim(wred))
      wvece=14-wocup
   ?? replicate('*',wvece)
   ?? replicate('*',9)
   ?  'Certificado n£mero:'
   ?? wcerti pict '9999999'
   ?? replicate('*',16)
   ?? ' Km.:'
   ?? wkmbtmt pict '9999999999'
   ?? replicate('*',13)
eject
set printer off
set device to screen
return                     
                           