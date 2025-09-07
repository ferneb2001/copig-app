procedure span14
* Cedula Notificatoria (Nro 14)
* Al Municip comunicando falta presen.Cert.Habil.Prof. de Empresa
*  incluye lectura de datos del expediente.
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
use spprofe index spprofe
select 2
use spmatrie index spmatrie
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
    @04,30 say 'CEDULA NOTIFICATORIA NRO.2'
    @06,01 say 'Matricula:       Categor¡a:    Nombre:'
    @08,01 say 'Fs.  N§  :       Expte.Munic.N§:              Municipalidad:'
    @11,01 say 'Texto cabecera:'
    @18,01 say 'Fdo:'
   wmatri=0
   wcateg=space(2)
   @23,01 say 'Indique Nro.de matricula o 99999 para salir'
   @06,12 get wmatri pict '99999'
   read
   if wmatri<>99999
      @23,01 clear to 23,78
*      @06,29 get wcateg pict '!!'
*      read
	 wcateg='EM'
      wkey=str(wmatri,5)+wcateg
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
*         wtitulo=titulo
         select 1
         seek(wkey1)
         if found()
            wnota=0
            wexpte=space(12)
            worden=space(6)
            wnomun=space(14)
            wfdo1=space(42)
            wfdo2=space(68)
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
*            select 6
*            seek(wtitulo)
*            if found()
*               wnomtit=titdesc
*            else
               wnomtit=space(30)
*            endif
            select 1                  
            @08,12 get wnota pict '9999'
            *  agregar rutina de busqueda de municipalidades
            @08,35 get wexpte pict 'XXXXXXXXXXXX'
            @08,61 get wnomun pict '!!!!!!!!!!!!!!'
            read
            @09,01 say domici
            @09,40 say wnomloc
            @09,56 say wnomdpto
            @10,01 say 'Fecha de providencia:'
            @10,50 say ' dd de mmmmmmmmm de 1xxx'
            wfechl=space(23)
            wenc0=space(39)
            wenc1=space(75)
            wenc2=space(75)
            wenc3=space(75)
            wenc4=space(75)
            wenc5=space(75)
            wenc6=space(75)
            @10,22 get wfechl
            read
            wexcod=space(1)
            wexnro=0
            wexano=0
            wop2=1
            @23,01 clear to 23,78
            @23,01 get wop2 pict '@*H \<1 Usa expedientes; \<2 Digita texto' size 1,1
            read
            if wop2=1
               @18,01 say 'Letra :'
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
                  wenc0=rtte
                  wenc2=cpto
                  wenc3=cpto2
                  wenc4=cpto3
                  wenc5=cpto4
                  wenc1='Expte. N§ '+str(wexnro,5)+'/'+wexcod+'/'+str(wexano,4)+' Caratulado: '+wenc0
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
            else
               @12,01 say 'debo irme'
            endif
            select 1
         else            
                  @12,1 get wenc1
                  @13,1 get wenc2
                  @14,1 get wenc3
                  @15,1 get wenc4
                  @16,1 get wenc5
                  @17,1 get wenc6
                  read
         endif         
         @18,6 get wfdo1
         @19,6 get wfdo2
            read
            @20,01 say 'Indique cantidad de copias (m¡nimo 1)'
            @20,40 get wcopias pict '99'
            read
            wop=1
            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               wop2=1
               @22,01 get wop2 pict '@*H \<Epson;\<Laser' size 1,1
               read
               set printer to lpt1
               set console off
               set printer on
               set device to printer
               if wop2=1
*                 ?chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
*               endif
*               wcopias=2
               do while wcopias>0
                  ?'     CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
*                  ?'                    M E N D O Z A'
                  ?'        Decreto Ley N. 3485/63  -  Ley  5908  y  Ley 6377'
                  ?
                  ?chr(27)+chr(71)
                  ?? 'C E D U L A   N O T I F I C A T O R I A' at 20
                  ??chr(27)+chr(72)
                  ?
                  ? wenc1 at 1
                  ? wenc2 at 1
                  ? wenc3 at 1
                  if wenc4<>space(75)
                     ? wenc4 at 1
                  endif
                  if wenc5<>space(75)   
                     ? wenc5 at 1
                  endif
                  if wenc6<>space(75)   
                     ? wenc6 at 1
                  endif   
                  ?
*                 ?
                  ?'     En este Expte. recay¢, a fs. '
                  ??chr(27)+chr(71)
                  ??wnota pict '9999'
                  ??chr(27)+chr(72)
                  ??', la siguiente providencia de fecha'
                  ? wfechl at 5
                  ?? '.- - - - - - - - - - - - - - - - - - - - - -'
*                 ?
                  ?'     VISTO. De conformidad con la comunicaci¢n efectuada por la Municipa-'
                  ?'     lidad de '
                  ?? wnomun
                  ?? ' a fs. 1, donde nos  informan que no ha  sido'
                  ?  '     presentado  en el Epte. Municipal N§ '
                  ?? wexpte pict 'XXXXXXXXXXXX'
                  ?? ' el  Certificado de '
                  ?'     Habilitacion  Profesional, por DEPARTAMENTO  ADMINISTRATIVO, notif¡-' 
                  ?'     quese por el  t‚rmino de DIEZ (10) DIAS HABILES a partir de su noti-'
                  ?'     ficaci¢n, -con fotocopia de Fs. 1-, a la Empresa '
*                  ??wnomtit
                  ? '     '
                  ?? nombre
                  ?? ' Matr.  N§: '
                  ?? wmatri pict '99999'
                  ?? '  Categor¡a: '
                  ?? wcateg pict 'XX'
                  ?? ',' 
                  ?'     que se encuentra en transgresi¢n con el Art. 46§ de la ley 5908, mo-'
                  ?'     dificatorio del Art. 27§ del Decreto Ley 3485/63, por lo que  deber '
*                 ?? wexpte pict '9999'
                  ?'     efectuar el correspondiente descargo y cumplir, en el caso, con  sus'
                  ?'     obligaciones  estatu¡das en la legislaci¢n  vigente. '
                  ??chr(27)+chr(69)
                  ??'Caso contrario,'
                  ?'     de no dar cumplimiento, quedar  suspendida en el ejercicio profesio-'
                  ?'     nal, de conformidad con lo establecido en Resoluci¢n N§ 22/94 de es-'
                  ?'     te  Consejo. - Firmado.:( '
                  ?? wfdo1
                  if wfdo2<>space(69)
                     ?'     '
                     ?? wfdo2
                  endif
                  ??chr(27)+chr(70)   
                  ? 
                  ?'     A continuaci¢n  transcribimos textualmente la parte pertinente de la'
                  ?'     Resoluci¢n 22/94:'
                  ?'     "EL CONSEJO PROFESIONAL DE INGENIEROS, AGRIMENSORES Y  GEOLOGOS, RE-'
                  ?'     SUELVE: SUSPENDER en la actividad profesional a toda aquella empresa'
                  ?'          en todo el  mbito de la Provincia, que no d‚  cumplimiento a lo'
                  ?'     presentaci¢n del  Certificado de Habilitaci¢n  Profesional  luego de'
                  ?'     transcurrido DIEZ (10) DIAS de su notificaci¢n. Dicha suspensi¢n se-'
                  ?'     r  LEVANTADA un vez que haya dado cumplimiento a lo  establecido  en'
                  ?'     el Decreto Ley 3485/63 modificaco por Ley 5908/92 Art. 2§. Previo  a'
                  ?'     ser rehabilitada para ejercer su actividad, la empresa  debe  can- /'
                  ?'     celar todos los  GASTOS Y COSTAS que demanden su emplazamiento seg£n'
                  ?'     Art.46 - Ley 5908 - Art.3§. Ante la reiteraci¢n de transgresiones de'
                  ?'     este tipo, el CONSEJO PROFESIONAL podr  aplicar  SANCIONES m s seve-'
                  ?'     ras,  las  que  se  encuentran tipificadas en el Cap¡tulo V "REGIMEN'
                  ?'     DISCIPLINARIO" del Dec. Ley 3485/63. En todos los casos, antes de a-'
                  ?'     plicar las SANCIONES, debe  verificarse  que  se den todos los pasos'
                  ?'     administrativos y legales que correspondan de acuerdo a lo prescrip-'
                  ?'     to en el Dec. Ley 3485/63 Mod. por Ley 5908.- (Fdo.) Dionisio  Dena-'
                  ?'     zis, Ing. en Electr¢nica, (Presidente) Alfredo M. Sejas, M. M. de O-'
                  ?'     bras, (Secretario).- '
*                 ?
            *     ?chr(27)+chr(72)
                  ?'n2'
                  ??'MENDOZA,' at 35
                  ??day(date()) pict '99' at 44
                  ??' de '    at 46 
                  ??wmeses(month(date())) at 50
                  ??' de '    at 59
                  ??year(date()) at 63
                  ?
                  ?'     NOTA: Se comunicar  dicha suspensi¢n a todas las Municipalidades  de' 
                  ?'     la Provincia, debiendo abonar, una vez cumplimentado  el  tr mite de'
                  ?'     presentaci¢n del Certificado ante este Consejo, los costos de dichas'
                  ?'     comunicaciones que se remiten mediante Carta  Certificada y a la fe-'
                  ?'     cha, ascienden a pesos noventa y nueve ($ 99.-).--------------------'
*                 ?
                  ?
                  ?'     Domicilio del Notificado:'
                  ??chr(27)+chr(71)
*                 ?wnomtit at 5
                  ?nombre at 5
                  ?domici at 5
                  ?wnomloc at 5
                  ?wnomdpto at 5
                  ?wcp at 5
                  ??wnomprov at 12
*                 ?
                  wcopias=wcopias-1
                  eject
               enddo
               else
               if wop2=2
                 ??chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
                 ??chr(027)+chr(038)+chr(108)+chr(050)+chr(054)+chr(065)
                 ??chr(027)+chr(040)+chr(115)+chr(048)+chr(083)
*               endif
*               wcopias=2
               do while wcopias>0
                  ?'     CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
*                  ?'                    M E N D O Z A'
                  ?'        Decreto Ley N. 3485/63  -  Ley  5908  y  Ley 6377'
                  ?
*                  ?chr(27)+chr(71)
                 ?chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
                  ?? 'C E D U L A   N O T I F I C A T O R I A' at 20
*                  ??chr(27)+chr(72)
                 ??chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
                  ?
                  ? wenc1 at 1
                  ? wenc2 at 1
                  ? wenc3 at 1
                  if wenc4<>space(75)
                     ? wenc4 at 1
                  endif
                  if wenc5<>space(75)   
                     ? wenc5 at 1
                  endif
                  if wenc6<>space(75)   
                     ? wenc6 at 1
                  endif   
                  ?
                  ?'     En este Expte. recay¢, a fs. '
                  ??chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
                  ??wnota pict '9999'
                  ??chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
                  ??', la siguiente providencia de fecha'
                  ? wfechl at 5
                  ?? '.- - - - - - - - - - - - - - - - - - - - - -'
*                 ?
                  ?'     VISTO. De conformidad con la comunicaci¢n efectuada por la Municipa-'
                  ?'     lidad de '
                  ?? wnomun
                  ?? ' a fs. 1, donde nos  informan que no ha  sido'
                  ?  '     presentado  en el Epte. Municipal N§ '
                  ?? wexpte pict 'XXXXXXXXXXXX'
                  ?? ' el  Certificado de '
                  ?'     Habilitacion  Profesional, por DEPARTAMENTO  ADMINISTRATIVO, notif¡-' 
                  ?'     quese por el  t‚rmino de DIEZ (10) DIAS HABILES a partir de su noti-'
                  ?'     ficaci¢n, -con fotocopia de Fs. 1-, a la empresa'
*                 ??wnomtit
                  ? '     '
                  ?? nombre
                  ?? ' Matr.  N§: '
                  ?? wmatri pict '99999'
                  ?? '  Categor¡a: '
                  ?? wcateg pict 'XX'
                  ?? ',' 
                  ?'     que se encuentra en transgresi¢n con el Art. 46§ de la ley 5908, mo-'
                  ?'     dificatorio del Art. 27§ del Decreto Ley 3485/63, por lo que  deber '
                  ?'     efectuar el correspondiente descargo y cumplir, en el caso, con  sus'
                  ?'     obligaciones  estatu¡das en la legislaci¢n  vigente. '
                  ??chr(027)+chr(040)+chr(115)+chr(051)+chr(066)
                  ??'Caso contrario,'
                  ?'     de no dar cumplimiento, quedar  suspendida en el ejercicio profesio-'
                  ?'     nal, de conformidad con lo establecido en Resoluci¢n N§ 22/94 de es-'
                  ?'     te  Consejo. - Firmado.:( '
                  ?? wfdo1
                  if wfdo2<>space(69)
                     ?'     '
                     ?? wfdo2
                  endif
                  ??chr(027)+chr(040)+chr(115)+chr(048)+chr(066)
                  ??chr(027)+chr(038)+chr(108)+chr(056)+chr(068)
                  ? 
                  ?'     A continuaci¢n  transcribimos textualmente la parte pertinente de la'
                  ?'     Resoluci¢n 22/94:'
                  ?'     "EL CONSEJO PROFESIONAL DE INGENIEROS, AGRIMENSORES Y  GEOLOGOS, RE-'
                  ?'     SUELVE: SUSPENDER en el ejercicio profesional a toda  aquella empre-'
                  ?'     sa,  en todo el  mbito de la Provincia, que no d‚  cumplimiento a lo'
                  ?'     presentaci¢n del  Certificado de Habilitaci¢n  Profesional  luego de'
                  ?'     transcurrido DIEZ (10) DIAS de su notificaci¢n. Dicha suspensi¢n se-'
                  ?'     r  LEVANTADA un vez que haya dado cumplimiento a lo  establecido  en'
                  ?'     el Decreto Ley 3485/63 modificado por Ley 5908/92 Art. 2§. Previo  a'
                  ?'     ser rehabilitada para ejercer su  actividad,  la  empresa  debe can-'
                  ?'     celar todos los  GASTOS Y COSTAS que demanden su emplazamiento seg£n'
                  ?'     Art.46 - Ley 5908 - Art.3§. Ante la reiteraci¢n de transgresiones de'
                  ?'     este tipo, el CONSEJO PROFESIONAL podr  aplicar  SANCIONES m s seve-'
                  ?'     ras,  las  que  se  encuentran tipificadas en el Cap¡tulo V "REGIMEN'
                  ?'     DISCIPLINARIO" del Dec. Ley 3485/63. En todos los casos, antes de a-'
                  ?'     plicar las SANCIONES, debe  verificarse  que  se den todos los pasos'
                  ?'     administrativos y legales que correspondan de acuerdo a lo prescrip-'
                  ?'     to en el Dec. Ley 3485/63 Mod. por Ley 5908.- (Fdo.) Dionisio  Dena-'
                  ?'     zis, Ing. en Electr¢nica, (Presidente) Alfredo M. Sejas, M. M. de O-'
                  ?'     bras, (Secretario).- '
                  ??chr(027)+chr(038)+chr(108)+chr(054)+chr(068)
                  ?'n2'
                  ??'MENDOZA,' at 35
                  ??day(date()) pict '99' at 44
                  ??' de '    at 46 
                  ??wmeses(month(date())) at 50
                  ??' de '    at 59
                  ??year(date()) at 63
                  ?
                  ?'     NOTA: Se comunicar  dicha suspensi¢n a todas las Municipalidades  de' 
                  ?'     la Provincia, debiendo abonar, una vez cumplimentado  el  tr mite de'
                  ?'     presentaci¢n del Certificado ante este Consejo, los costos de dichas'
                  ?'     comunicaciones que se remiten mediante Carta  Certificada y a la fe-'
                  ?'     cha, ascienden a pesos noventa y nueve ($ 99.-).--------------------'
*                 ?
                  ?
                  ?'     Domicilio del Notificado:'
*                  ??chr(27)+chr(71)
*                  ?wnomtit at 5
                  ?nombre at 5
                  ?domici at 5
                  ?wnomloc at 5
                  ?wcp at 5
                  ??wnomdpto at 12
                  ??wnomprov at 30
*                 ?
                  wcopias=wcopias-1
                  eject
               enddo
               endif
               endif
                select 7
                use spcedul
                append blank
                replace ce_nro    with wnota
                replace ce_fecha  with date()
                replace ce_orden  with worden
                replace ce_tipo   with 2
                replace ce_nota   with 0
                replace ce_matri  with wmatri
                replace ce_categ  with wcateg
                replace ce_fprov  with wfechl
                replace ce_enc1   with wenc1
                replace ce_enc2   with wenc2
                replace ce_enc3   with wenc3
                replace ce_enc4   with wenc4
                replace ce_enc5   with wenc5
                replace ce_enc6   with wenc6
                replace ce_op2    with 2
                   ce_xcod=space(1)
	               ce_xnro=0
	               ce_xano=0
	            replace ce_munic with wnomun
	            replace ce_exptemu with wexpte
	            replace ce_fenot  with {  /  /  }   
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
   