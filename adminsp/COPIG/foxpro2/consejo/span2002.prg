 procedure span2002
* Cedula Notificatoria (Nro 1)
* Al profesional comunicando falta cumplim.s/nota    
* incluye uso del archivo exptes.dbf
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
use spprof index spprof.idx
select 2
use spmatri index spmatri.idx
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
            wenc1=space(75)
            wenc2=space(75)
            wenc3=space(75)
            wenc4=space(75)
            wenc5=space(75)
            wenc6=space(75)
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
            wfechl=space(23)
            wenc0=space(39)
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
                     wenc1='Expte. N§. '+str(wexnro,5)+'/'+wexcod+'/'+str(wexano,4)+', Caratulado: '+wenc0
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
            @23,01 clear to 23,78
            @23,30 get wop pict '@*H \<Imprimir;\<No imprimir;\<Salir' size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               wop2=1
               @22,01 clear to 22,78
*               @22,01 get wop2 pict '@*H \<Epson;\<Laser;\Micromarc' size 1,1
*               read
                  set printer to lpt1
                  set console off
                  set printer on
                  set device to printer
*               if wop2 = 2
*                  ?chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
*               else
*               	  if wop2 = 3
*               	     ?chr(027)+chr(40)+'12'+chr(085)
*               	  endif      
*               endif      
*               wcopias=2
               do while wcopias>0
                  ?'  CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
*                  ?'                    M E N D O Z A'
                  ?'  Decreto Ley N. 3485/63 - Ley 5908 - Ley 6377 - Ley 6936'
                  ?
                  ?chr(27)+chr(71)
                  ??' C E D U L A   N O T I F I C A T O R I A' at 20    
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
                  ?'En este Expte. recay¢, a fs. '
                  ??chr(27)+chr(71)
                  ??wnota pict '9999'
                  ??chr(27)+chr(72)
                  ??', la siguiente providencia de fecha'
                  ? wfechl 
                  ?? '----------------------------------------------------'
                  ?
                  ?'VISTO.  A los  efectos de verificarse el  cumplimiento de las disposiciones'
                  ?'vigentes seg£n Decreto Ley 3485/63 y su Decreto Reglamentario 1041/65, y de'
                  ?'acuerdo al listado de profesionales  pertenecientes a la planta de personal'
                  ?'de la Direcci¢n Provincial de Vialidad, por DEPARTAMENTO ADMINISTRATIVO no-'
                  ?'tif¡quese al (a la):                                                       '
                  ?chr(27)+chr(71)
                  ?? wnomtit at 4
                  ?? ' '
                  ?? nombre
                  ?'    Matr¡cula N§ '
                  ??wmatri pict '99999'
                  ??',  Cat. '
                  ?? wcateg pict 'XX'
                  ??chr(27)+chr(72) 
                  ?'para que en el t‚rmino de '
                  ??chr(27)+chr(71)
                  ??' DIEZ (10) DIAS  HABILES'
                  ??chr(27)+chr(72)
                  ??' a partir de su notifica-'
                  ?'ci¢n cancele la matr¡cula  correspondiente al  a¤o 2002, por encontrarse en'
                  ?'trasgresi¢n al  Decreto Ley 3485/63, Decreto  Reglamentario  1041/65, y Ley'
                  ?'6936,'
                  ??chr(27)+chr(71)
                  ??' al no estar  debidamente  habilitado/a ante  este Consejo Profesional'
                  ?'para ejercer su profesi¢n.'
                  ??chr(27)+chr(72)
                  ??' Por lo tanto se le intima a que concurra a nues-'
                  ?'tras oficinas de lunes a viernes, en horario de 8.30 a  12.30 hs. a efectos'
                  ?'de  normalizar su situaci¢n,'
                  ??chr(27)+chr(71)
                  ??' bajo  apercibimiento de aplic rsele la sanci¢n'
                  ?'de multa  prevista en el Art.32ø del citado  Decreto Ley, que a la fecha de'
                  ?'la presente  notificaci¢n asciende a la  suma de pesos  DOSCIENTOS CUARENTA'
                  ?'($240,00).-'
                  ??chr(27)+chr(72)
                  ??' Transcribirle para su conocimiento, los art 1ø, 2ø, 3ø inc.c) ,'
                  ?'7ø y 32ø del Decreto Ley  3485/63 y 7ø del Decreto 1041/65. Cumplido y ven-'
                  ?'cido el t‚rmino fijado, previamente, prod£zcase  informe por SECCION REGIS-'
                  ?'TRO PROFESIONAL y posteriormente, PASE a COMISION DE  INTERPRETACION Y SAN-'
                  ?'CIONES para su consideraci¢n y dem s efectos que estime corresponder.-(Fdo:'
                  ?'Ing. En Construcciones Ra£l H. Delle Donne (Secretario).-------------------'
			      ??chr(27)+chr(70)
                  ?CHR(15)
                  ??CHR(27)+CHR(48)
                  ??CHR(27)+CHR(45)+'1'
                  ?'Art.1ø'
                  ??CHR(27)+CHR(45)+'0'
                  ??' (Decreto Ley 3485/63): El ejercicio de las profesiones de la Ingenier¡a, en  todas sus  especialidades y la Geolog¡a queda'
                  ?'sujeto dentro del territorio de la Provincia de Mendoza, a las disposiciones del presente Decreto Ley y sus reglamentaciones.----'
                  ??CHR(27)+CHR(45)+'1'
				  ?'Art.2ø'
                  ??CHR(27)+CHR(45)+'0'
				  ??' (Decreto Ley 3485/63): El ejercicio de las profesiones a que  se refiere el presente  Decreto Ley, deber  hacerse en todos'
                  ?'los casos, mediante la prestaci¢n personal de los servicios propios de cada una de ellas. Se considera ejercicio de la profesi¢n:'
                  ?'a) El ofrecimiento o la prestaci¢n de servicios que impliquen o requieran los  conocimientos  inherentes y espec¡ficos propios de'
                  ?'las profesiones a que se refiere el Art¡culo 1, b) El desempe¤o de cargos p£blicos, transitorios o permanentes, provinciales, mu-'
                  ?'nicipales o judiciales que requieran los conocimientos aludidos en el  inciso  anterior; c) La  emisi¢n, evacuaci¢n, expedici¢n y'
                  ?'presentaci¢n de laudos, consultas, estudios, consejos, informes, dict menes, compulsas, pericias, recursos fundados en considera-'
                  ?'cionesde orden t‚cnico, mensura, tasaciones, escritos, cuentas, an lisis,  c lculos, certificados, certificaciones, asesoramiento'
                  ?'y cualquier otra actividad vinculada con el desempe¤o de las  profesiones  comprendidas en este Decreto Ley, para  particulares o'
                  ?'ante Tribunales o reparticiones nacionales, provinciales o municipales. El  ejercicio de la  docencia, en cuanto se refiere a los'
                  ?'t¡tulos habilitantes, queda exclu¡do de las previsiones de este Decreto Ley.-".--------------------------------------------------'
                  ??CHR(27)+CHR(45)+'1'
                  ?'Art.3ø'
                  ??CHR(27)+CHR(45)+'0'
                  ??' (Decreto Ley 3485/63): Para ejercer las profesiones sujetas al presente  Decreto  Ley se requiere:...c) renovar anualmente'
                  ?'la inscripci¢n, fijando domicilio legal dentro de la Provincia".-----------------------------------------------------------------'
                  ??CHR(27)+CHR(45)+'1'
                  ?'Art.7ø'
                  ??CHR(27)+CHR(45)+'0'
                  ??' (Decreto Ley 3485/63): El registro de Profesionales, que llevar  el Consejo, ser   £nico en la Provincia. Ninguna reparti-'
                  ?'ci¢n, incluso las muunicipales, podr n llevar independientemente otro registro debiendo usar el establecido en el presente Decre-'
                  ?'to Ley; ni podr n imponer contribuciones pecuniarias que grave el libre ejercicio profesional".----------------------------------'
                  ??CHR(27)+CHR(45)+'1'
                  ?'Art.32ø'
                  ??CHR(27)+CHR(45)+'0'
                  ??' (Decreto Ley 3485/63): El ejercicio de la profesi¢n sin la inscripci¢n  correspondiente  ser  sancionado con una multa i-'
                  ?'gual al duplo del derecho de inscripci¢n anual vigente, que ser  doblada en  caso de  reincidencia. La multa se aplicar  sin per-'
                  ?'juicio de las dem s sanciones previstas en este Decreto Ley sobre el  particular. Las empresas  comerciales, industriales y dem s'
                  ?'entidades mencionadas en el Art. 8 que no den cumplimiento a lo all¡  ordenado, ser n  sancionadas con  multa de diez a cincuenta'
                  ?'veces el valor de la inscripci¢n".-----------------------------------------------------------------------------------------------'
                  ??CHR(27)+CHR(45)+'1'
                  ?'Art.7ø'
                  ??CHR(27)+CHR(45)+'0'
                  ??' (Decreto N. 1041/65): La Falta de reinscripci¢n anual produce  autom ticamente la  inhabilitaci¢n del profesional o la em-'
                  ?'presa y s¢lo podr n ser rehabilitados por decisi¢n del Consejo previo pago de los recargos por mora, salvo caso de fuerza mayor".' 
                  ?'     '
                  ?chr(18)
                  ??chr(27)+chr(50)   
                  ??'MENDOZA,' at 37
                  ??day(date()) pict '99' at 46
                  ??' de '    at 48 
                  ??wmeses(month(date())) at 52
                  ??' de '    at 61
                  ??year(date()) at 65
                  ?
                  ?
                  ?
				  ?'                        SERGIO E. GONZALEZ           RAUL H. DELLE DONNE  '
				  ?'                      Ing. en Construcciones       Ing. en Construcciones '
				  ?'                            Presidente                   Secretario       '
                  ?'     Domicilio del Notificado:'
                  ??chr(27)+chr(71)
                  ?wnomtit at 5
                  ?nombre at 5
                  ?domici at 5
                  ?wnomloc at 5
                  ?wnomdpto at 5
                  ?wcp at 5
                  ??wnomprov at 12
                  ??'                                          span2002'
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
               ce_munic=space(14)
               ce_exptemu=space(12)
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
   