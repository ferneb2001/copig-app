 procedure span1b
* Cedula Notificatoria (Nro 1)
* Al profesional comunicando falta cumplim.s/nota    
* incluye uso del archivo exptes.dbf
*  ampliado longitud de renglones
set talk off
dimension wmeses(12)
store 'enero' to wmeses(1)
store 'febrero' to wmeses(2)
store 'marzo'   to wmeses(3)
store 'abril'   to wmeses(4)
store 'mayo'    to wmeses(5)
store 'junio'   to wmeses(6)
store 'julio'   to wmeses(7)
store 'agosto'  to wmeses(8)
store 'setiembre' to wmeses(9)
store 'octubre'   to wmeses(10)
store 'noviembre' to wmeses(11)
store 'diciembre' to wmeses(12)
select 1
use spprof index spprof
select 2
use spmatri index spmatri
select 3
use splocal order cod
select 4
use spprov order prov
select 5
use spdpto order dpto
select 6
use sptitu order titulo
select 8
use exptes index exptesi
wkey=space(7)
wkey1=space(9)
wkeyex=space(10)
wmatri=0
wcateg=space(2)
wcopias=1
do while wmatri<>99999
    @04,01 clear to 23,78
    @04,30 say 'CEDULA NOTIFICATORIA NRO.1'
    @06,01 say 'Matricula:       Categor¡a:    Nombre:'
    @08,01 say 'Fs.  N§  :       Nota reclamo N§:           Fs.agregadas:'
    @11,01 say 'Texto cabecera:'
   wmatri=0
   wcateg=space(2)
   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
   @06,12 get wmatri pict '99999'
   read
   if wmatri<>99999
      @23, 01 clear to 23,78
      @06,29 get wcateg pict '!!'
      read
      wkey=str(wmatri,5)+wcateg
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
         wtitulo=titulo
         select 1
         seek(wkey1)
         if found()
            wnota=0
            wexpte=0
            worden=space(6)
            @06,40 say nombre
            select 3
            seek(str(a.locali,3))
            if found()
               wnomloc=nombre
               wcp=cpost
            else
               wnomloc=space(15)
            endif
            select 5
            seek(str(a.dpto,3))
            if found()
               wnomdpto=nombre
            else
               wnomdpto=space(15)
            endif
            select 4
            seek(a.provin)
            if found()
               wnomprov=nombre
            else
               wnomprov=space(15)
            endif
            select 6
            seek(wtitulo)
            if found()
               wnomtit=titdesc
            else
               wnomtit=space(15)
            endif
            select 1                  
            @08,12 get wnota pict '9999'
            @08,35 get wexpte pict '9999'
            @08,59 get worden pict '!!!!!!'
            read
            @09,01 say domici
            @09,40 say wnomloc
            @09,56 say wnomdpto
            @10,01 say 'Fecha de providencia:'
            @10,50 say ' dd de mmmmmmmmm de 1xxx'
            wexcod=space(1)
            wexnro=0
            wexano=0 
            wfechl=space(22)
            wenc1=space(75)
            wenc2=space(75)
            wenc3=space(75)
            wenc4=space(75)
            wenc5=space(75)
            wenc6=space(75)
            @10,22 get wfechl
            read
            wop2=1
            @23, 01 clear to 23,78
            @23, 01 get wop2 pict '@*H \<1 Usa expedientes; \<2 Digita texto' size 1,1
            read
            if wop2 = 1
               @18,01 say 'Letra: '
               @18,10 say 'N£mero:'
               @18,25 say 'A¤o:'
               @18,08 get wexcod pict '!'
               @18,19 get wexnro pict '99999'
               @18,30 get wexano pict '9999'
               read
               if lastkey() <> 27
                  wkeyex=wexcod+str(wexnro,5)+str(wexano,4)
                  select 8
                  seek(wkeyex)
                  if found()
                     wenc1='Expte. N§. '+wexcod+'/'+str(wexnro,5)+'/'+str(wexano,4)+', Caratulado: '
                     wenc2=cpto
                     wenc3=cpto2
                     wenc4=cpto3
                     wenc5=cpto4
                     @12,01 say wenc1
                     @13,01 say wenc2
                     @14,01 say wenc3
                     @15,01 say wenc4
                     @16,01 say wenc5
                     @17,01 say wenc6
                  else   
                     @12,1 get wenc1
                     @13,1 get wenc2
                     @14,1 get wenc3
                     @15,1 get wenc4
                     @16,1 get wenc5
                     @17,1 get wenc6
                     read
                  endif
                  select 1
               else
                  @12,01 say 'debo irme'
               endif
            else            
                     @12,1 get wenc1
                     @13,1 get wenc2
                     @14,1 get wenc3
                     @15,1 get wenc4
                     @16,1 get wenc5
                     @17,1 get wenc6
                     read
            endif         
            wcopias=1
            @21,01 say 'Indique cantidad de copias (m¡nimo = 1)'
            @21,40 get wcopias pict '99'
            read
            wop=1
            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               set printer to lpt1
               set console off
               set printer on
               set device to printer
*               wcopias=2
               do while wcopias>0
                  ?'  CONSEJO PROFESIONAL DE INGENIEROS,'
                  ?'  AGRIMENSORES Y GEOLOGOS  - MENDOZA'
                  ?'  Decreto Ley N.3485/63  Ley 5908/92'
                  ?
                  ?chr(27)+chr(71)
                  ?? 'C E D U L A   N O T I F I C A T O R I A' at 20
                  ??chr(27)+chr(72)
                  ?
                  ? wenc1 at 2
                  ? wenc2 at 2
                  ? wenc3 at 2
                  if wenc4<>space(75)
                     ? wenc4 at 2
                  endif
                  if wenc5<>space(75)   
                     ? wenc5 at 2
                  endif
                  if wenc6<>space(75)   
                     ? wenc6 at 2
                  endif   
                  ?
*                  ?
                  ?'  En  este  Expte.  recay¢, a fs. '
                  ??chr(27)+chr(71)
                  ??wnota pict '9999'
                  ??chr(27)+chr(72)
                  ??', la  siguiente  providencia  de fecha'
                  ? wfechl at 2
                  ?? '---------------------------------------------------'
                  ?
                  ?'  VISTO. Ante la falta de cumplimiento por  parte del  profesional actuante'
*                  ?'     tuante '
                  ?? wnomtit
                  ?? ' '
                  ?? nombre
                  ?'  Matr¡cula N§ '
                  ??wmatri pict '99999'
                  ??', Cat. '
                  ?? wcateg pict 'XX' 
                  ?? ' a los requerimientos efectuados mediante  nota'
                  ?'  N§ '
                  ?? wexpte pict '9999'
                  ?? ' por DEPARTAMENTO ADMINISTRATIVO agr‚guese fotocopia de la Resolu-'
                  ?'  ci¢n N§ 22/94 y notif¡quese al citado profesional con transcripcion de la'
                  ?'  parte pertinente de la mencionada  Resoluci¢n por el t‚rmino de DIEZ (10)'
                  ?'  t‚rmino de DIEZ (10) DIAS HABILES a partir de su notificaci¢n.  Cum-'
                  ?'  plido y vencido el t‚rmino fijado, PASE a informe de SEC. CERTIFICA-'
                  ?'  DO DE HABILITACION PROFESIONAL.- - - - - - - - - - - - - - - - - - -'
                  ?
                  ?'     A continuaci¢n se transcribe la parte pertinente de la Resoluci¢n N§'
                  ?'     22/94 agregadas a fs. '
                  ?? worden
                  ?? '.- - - - - - - - - - - - - - - - - - - -'
                  ?
                  ?'     "EL CONSEJO PROFESIONAL DE INGENIEROS, AGRIMENSORES y GEOLOGOS,  RE-'
                  ?'     SUELVE: SUSPENDER en el ejercicio profesional a todo aquel profesio-'
                  ?'     nal, en todo el  mbito de la Provincia, que no d‚ cumplimiento  a la'
                  ?'     presentaci¢n del Certificado de Habilitaci¢n  Profesional  luego  de'
                  ?'     transcurrido DIEZ (10) DIAS de su notificaci¢n. Dicha suspensi¢n se-'
                  ?'     r  LEVANTADA una vez que haya dado cumplimiento a lo establecido  en'
                  ?'     el Decreto Ley 3485/63 modificado por Ley 5908/92 Art. 2§. Previo  a'
                  ?'     ser rehabilitado para ejercer su profesi¢n, el profesional debe can-'
                  ?'     celar todos los GASTOS y COSTAS que demanden su emplazamiento  seg£n'
                  ?'     Art.46 - Ley 5908 - Art.3§. Ante la reiteraci¢n de transgresiones de'
                  ?'     este tipo, el CONSEJO PROFESIONAL podr  aplicar SANCIONES  m s seve-'
                  ?'     ras, las que se encuentran tipificadas en el Cap¡tulo V "REGIMEN DIS-'
                  ?'     CIPLINARIO" del Dec. Ley 3485/63. En todos los casos, antes de apli-'
                  ?'     car las SANCIONES, debe verificarse  que se den todos los  pasos ad-'
                  ?'     ministrativos  y legales que correspondan de acuerdo a lo prescripto'
                  ?'     en el Dec. Ley 3485/63 Mod. por Ley 5908.- (Fdo.) Dionisio  Denazis,'
                  ?'     Ing. en Electr¢nica, (Presidente) Alfredo M. Sejas, M. M. de  Obras,'
                  ?'     (Secretario).-"'   
*                  ?   
                  ?'MENDOZA,' at 37
                  ??day(date()) pict '99' at 46
                  ??' de '    at 48 
                  ??wmeses(month(date())) at 52
                  ??' de '    at 61
                  ??year(date()) at 65
                  ?
                  ?'     NOTA: Se comunicar  dicha suspensi¢n a todas las Municipalidades  de'
                  ?'     la Provincia, debiendo abonar, una vez  cumplimentado  el tr mite de'
                  ?'     presentaci¢n del Certificado ante este Consejo, los costos de dichas'
                  ?'     comunicaciones que se remiten mediante Carta  Certificada y a la fe-'
                  ?'     cha, ascienden a pesos noventa y nueve ($ 99.-).--------------------'
                  ?
                  ?'     Domicilio del Notificado:'
                  ??chr(27)+chr(71)
                  ?wnomtit at 5
                  ?nombre at 5
                  ?domici at 5
                  ?wnomloc at 5
                  ?wnomdpto at 5
                  ?wcp at 5
                  ??wnomprov at 12
                  ?
                  wcopias=wcopias-1
                  eject
               enddo
               select 7
               use spcedul
               append blank
               replace ce_nro    with wnota
               replace ce_fecha  with date()
               replace ce_orden  with worden
               replace ce_tipo   with 1
               replace ce_nota  with wexpte
               replace ce_matri  with wmatri
               replace ce_categ  with wcateg
               replace ce_fprov with wfechl
               replace ce_enc1   with wenc1
               replace ce_enc1   with wenc1
               replace ce_enc2   with wenc2
               replace ce_enc3   with wenc3
               replace ce_enc4   with wenc4
               replace ce_enc5   with wenc5
               replace ce_enc6   with wenc6
               replace ce_op2    with wop2
               if wop2 = 1
                  replace ce_xcod with wexcod
                  replace ce_xnro with wexnro
                  replace ce_xano with wexano
               else
                  ce_xcod=space(1)
                  ce_xnro=0
                  ce_xano=0
               endif
               replace ce_fenot with {  /  /  }      
               *eject
               set printer off
               set device to screen
            endif  
         else
            @06, 40 say 'No existe'  
         endif
      endif
  endif    
enddo
@04,01 clear to 23,78
close all   
close all
   