procedure spinfem
*informe de Seccion Registro Profesional para Empresas
@03,01 clear to 23,78
@03,21 say 'INFORME DE SECCION REGISTRO PROFESIONAL'
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
dimension wsantipo(10), wsaninci(10), wsanreso(10), wsanfere(10), wsanvigd(10)
dimension wsanvigh(10), wsancnma(10), wsancpag(10), wsanfpag(10), wsanobs(10)
dimension wrstipo(10), wrstobs(10), wrstori(10), wrstfac(10), wrstpag(10), wrstimp(10), wrstotr(10)
store 0 to wsanreso(1), wsanreso(2), wsanreso(3), wsanreso(4), wsanreso(5)
store 0 to wsanreso(6), wsanreso(7), wsanreso(8), wsanreso(9), wsanreso(10)
store space(1) to wsaninci(1), wsaninci(2), wsaninci(3), wsaninci(4), wsaninci(5)
store space(1) to wsaninci(6), wsaninci(7), wsaninci(8), wsaninci(9), wsaninci(10)
store space(1) to wsantipo(1), wsantipo(2), wsantipo(3), wsantipo(4), wsantipo(5)
store space(1) to wsantipo(6), wsantipo(7), wsantipo(8), wsantipo(9), wsantipo(10)
store space(20) to wsanobs(1), wsanobs(2), wsanobs(3), wsanobs(4), wsanobs(5)
store space(20) to wsanobs(6), wsanobs(7), wsanobs(8), wsanobs(9), wsanobs(10)
store {  /  /  } to wsanfere(1), wsanfere(2), wsanfere(3), wsanfere(4), wsanfere(5)
store {  /  /  } to wsanfere(5), wsanfere(6), wsanfere(7), wsanfere(8), wsanfere(10)
store {  /  /  } to wsanvigd(1), wsanvigd(2), wsanvigd(3), wsanvigd(4), wsanvigd(5)
store {  /  /  } to wsanvigd(5), wsanvigd(6), wsanvigd(7), wsanvigd(8), wsanvigd(10)
store {  /  /  } to wsanvigh(1), wsanvigh(2), wsanvigh(3), wsanvigh(4), wsanvigh(5)
store {  /  /  } to wsanvigh(5), wsanvigh(6), wsanvigh(7), wsanvigh(8), wsanvigh(10)
store {  /  /  } to wsanfpag(1), wsanfpag(2), wsanfpag(3), wsanfpag(4), wsanfpag(5)
store {  /  /  } to wsanfpag(5), wsanfpag(6), wsanfpag(7), wsanfpag(8), wsanfpag(10)
store 0 to wsancnma(1), wsancnma(2), wsancnma(3), wsancnma(4), wsancnma(5)
store 0 to wsancnma(6), wsancnma(7), wsancnma(8), wsancnma(9), wsancnma(10)
store 0 to wsancpag(1), wsancpag(2), wsancpag(3), wsancpag(4), wsancpag(5)
store 0 to wsancpag(6), wsancpag(7), wsancpag(8), wsancpag(9), wsancpag(10)
store 0 to wrstimp(1),wrstimp(2), wrstimp(3), wrstimp(4), wrstimp(5), wrstimp(6)
store 0 to wrstimp(7), wrstimp(8), wrstimp(9), wrstimp(10)
store 0 to wrstotr(1),wrstotr(2), wrstotr(3), wrstotr(4), wrstotr(5), wrstotr(6)
store 0 to wrstotr(7), wrstotr(8), wrstotr(9), wrstotr(10)
store {  /  /  } to wrstori(1), wrstori(2), wrstori(3), wrstori(4), wrstori(5)
store {  /  /  } to wrstori(5), wrstori(6), wrstori(7), wrstori(8), wrstori(10)
store {  /  /  } to wrstfac(1), wrstfac(2), wrstfac(3), wrstfac(4), wrstfac(5)
store {  /  /  } to wrstfac(5), wrstfac(6), wrstfac(7), wrstfac(8), wrstfac(10)
store {  /  /  } to wrstpag(1), wrstpag(2), wrstpag(3), wrstpag(4), wrstpag(5)
store {  /  /  } to wrstpag(5), wrstpag(6), wrstpag(7), wrstpag(8), wrstpag(10)
store space(10) to wrstipo(1), wrstipo(2), wrstipo(3), wrstipo(4), wrstipo(5)
store space(10) to wrstipo(6), wrstipo(7), wrstipo(8), wrstipo(9), wrstipo(10)
store space(25) to wrstobs(1), wrstobs(2), wrstobs(3), wrstobs(4), wrstobs(5)
store space(25) to wrstobs(6), wrstobs(7), wrstobs(8), wrstobs(9), wrstobs(10)
wsigue='S'
wlin1='Secci¢n Registro Profesional INFORMA:'
WLIN2A='         Que la Empresa '
wlin3a='Matr¡cula: '
wlin3c=', figura inscripta  en  nuestros  Registros  Oficiales  desde  el'
wlin4b=', encontr ndose debidamente habilitada por el a¤o '
wlin5a='         Que no registra sanciones.-'
wlin6a='         Que el £ltimo domicilio registrado es:'
wlin7b=', NO encontr ndose debidamente habilitada por adeudar la  matr¡cula  co-'
wlin7ba=', NO encontr ndose debidamente habilitada para ejercer su               '
wlin7c='rrespondiente al a¤o '
wlin7d=', conforme al Decreto Ley'
wlin7e='3485/63 - Ley 5908.-'
wlin7f=', NO encontr ndose debidamente habilitada por adeudar las matr¡culas co-'
wlin7g='rrespondientes a los a¤os '
wlin7h=' a '
wlin7ha=' inclusive.-'
wlin7i='actividad por haber comunicado inactividad ante el Consejo Profesional.-'
wlin7j='actividad por haber sido dada de baja por el Consejo Profesional'     
wlin7k='actividad por estar suspendida.-'
wlin7l='profesi¢n por haber sido dada de baja la matr¡cula.-'
wlin8a='         Que registra la(s) siguiente(s) sancion(es):'
wlin8sa='Ley-Artic.  Inciso             Resol. Fecha   Confirm. Finaliza Matric.Cumplida    Observac.'
wlin8sb=space(80)
wlin8sc=space(80)
wlin8sd=space(80)
wlin8se=space(80)
wlin8sf=space(80)
wlin9a='         Que registra la(s) siguiente(s) restriccion(es): '
wlin10='         Que ha realizado el curso de post-grado en:'
wlin11='         Que no ha presentado constancia algun de haber realizado Curso de Es- '
wlin12='pecializaci¢n en Estructuras Antis¡smicas.'
wlin13='         Que registra los siguientes Representantes T‚cnicos:'
wlin14='     T¡tulo       Apellido y Nombre  Mat.Cat.   V¡nculo     desde  hasta '
windsan=1
windres=1
*select 7
*use SPTINF index SPTINFI
*go top
do while wsigue='S'
   wop=1
   @04,01 clear to 23,78
   @04,01 say 'MATRICULA       CATEGORIA    '
   @04,30 say 'NOMBRE: '
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Matricula';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(55)
         @04,30 say 'NOMBRE: '
         @23,01 say 'Indique el nombre de la empresa  '
         @05,20 get wnom pict '@!'
         read
        if lastkey()<>27
         SELECT 1
         use spprofe index spprofen
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow all for nombre =rtrim(wnom) in pnom
         deactivate window pnom 
         wkey=str(dctipo,1)+str(dcnro,8)
         WNOMBRE=NOMBRE
         select 2
         use spmatrie index spmatdoe
         locate for wkey=str(dctipo,1)+str(dcnro,8)
         do while found()
*         seek(wkey)
*         if found()
            wkey2=str(numero,5)+catego
            wmatric=numero
            wcatego=catego
*            IF b.condic<>'3'
			 wcondic=a.estado
			 whabili=b.habili
             if b.fechab<>{  /  /  }
			    winscr=b.fechab
			 else   
			    if b.inscr<>{  /  /  }
			       winscr=b.inscr
			    else
			 	   winscr={  /  /  }
			 	endif
			 endif	          
             do ver
*            endif   
            select 2
            continue
         enddo   
*         else
*           @04,10 say 'Sin matr¡cula'   
         endif
      else
         if wop= 3
            @04,01 say 'MATRICULA       CATEGORIA    '
            @23,01 say 'Indique el nro.de matricula y categoria o <ESC> para salir'  
            @04,11 get wmatric pict '99999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               @04,27 get wcatego pict '!!'
               read
               wkey2=str(wmatric,5)+wcatego
               select 2
               use spmatrie index spmatrie
               seek(wkey2)
               if found()
                  wkey=str(dctipo,1)+str(dcnro,8)
                  select 1
                  use spprofe index spprofe
                  seek(wkey)
                  if found()
                     wnombre=nombre
                     select 2
*                     if b.condic<>'3'
					 wcondic=a.estado
					 whabili=b.habili
        	         if b.fechab<>{  /  /  }
			 	        winscr=b.fechab
			         else
        			    if b.inscr<>{  /  /  }
		        	       winscr=b.inscr
			            else
			 	           winscr={  /  /  }
			        	endif
			         endif	          
                     do ver
*                    endif   
                 else
                     @04,38 say 'Sin datos personales'
                 endif
               else
                  @04,10 say 'Sin matr¡cula'   
               endif
*            else
            endif
         endif   
      endif          
   endif
enddo
@04,01 clear to 23,78
close all
return
****************************procedimiento ver ******* 
procedure ver
windsan=1
windres=1
store '99999' to wsanreso(windsan)
store '99999' to wrstipo(windres)
wkey2=str(wmatric,5)+wcatego
@04,11 say wmatric pict '99999'
@04,27 say wcatego
@04,38 say wnombre
do panta11
WNOTORGA=SPACE(30)
select 2   
@07,17 say b.habili
if a.estado = 'A'
	@08,17 say "Activa "
else
   if a.estado = 'C'
     @08,17 say "Comunico Inactividad"
   else
     if a.estado = 'F'
     	@08,17 say "Baja por Consejo"
     else
        if a.estado = 'S'
           @08,17 say "Suspendida"
        else
           if b.condic = '05'
              @08,17 say "Baja de Matricula"
           else
              @08,17 say "Inhabilitada otros motivos"
           endif
        endif
     endif
  endif
endif
wmatri=wmatric
wcateg=wcatego
save screen to panta11
select 4
use spsance index spsance
wsigsan='S'
wisanc=0
do while wsigsan='S'
   wlin=14
   @12,01 clear to 19,78
   do ponetit
   locate for wkey2=str(matric,5)+catego
   do while found()
      @wlin,2 say santipo
      @wlin,4 say saninci
      @wlin,6 say sanresol
      @wlin,12 say sanferes
      @wlin,21 say sanvigde
      @wlin,30 say sanvigha
      @wlin,38 say sancnmat pict '999'
      @wlin,42 say sancpag
      @wlin,44 say sanfpag
      @wlin,59 say sanobs
      wop=1
      @23,01 clear to 23,78
      @23,22 get wop pict '@*H \<informar y continuar;\<continuar;\<salir' size 1,1
      read
      if wop = 3
         wsigsan='N'
         exit
      else   
         if wop = 1
            wisanc=1
            do ingrsan
         endif
         wlin=wlin+1
         if wlin > 19
            do limpia
            wlin=14
         endif
         @23,01 clear to 23,78
         continue
      endif   
   enddo
   wsigsan='N'
enddo
w2opc=0
@23,01 get w2opc pict 'Enter para continuar' size 1,1
read
 
*        rutina de busqueda de restricciones              
select 9
use sprestri index sprestri
wsigres='S'
wirest=0
do while wsigres='S'
   wlin=14
   @12,01 clear to 19,78
*   do ponetire
   locate for wkey2=str(matric,5)+catego
   do while found()
      if restrotr = 0
         @wlin,1 say restrtipo
         @wlin,13 say observac
         @wlin,39 say restforig
         @wlin,48 say restfactu
         @wlin,57 say restfpago
         @wlin,66 say restimpo pict '99999,99'
         @wlin,75 say restrotr
         wop=1
         @23,01 clear to 23,78
         @23,22 get wop pict '@*H \<informar y continuar;\<continuar;\<salir' size 1,1
         read
         if wop = 3
            wsigres='N'
            exit
         else   
            if wop = 1
               wirest=1
               do ingrest
            endif
            wlin=wlin+1
            if wlin > 19
               do limpia
               wlin=14
            endif
            @23,01 clear to 23,78
  *          continue
         endif
      endif
      continue     
   enddo
   wsigres='N'
enddo
restore screen from panta11
select 4
use splocal index splocal
locate for d.cod=a.locali
if found()
   wwnloc=d.nombre
   wlocal=d.cod
else
   wwnloc=space(15)
   wlocal=0
endif      
select 5
use spdpto order dpto
locate for e.dpto=a.dpto
if found()
   wwndpto=e.nombre
   wdpto=e.dpto
else   
   wwndpto=space(15)
   wdpto=0
endif   
select 5
use spprov order prov
locate for e.prov=a.provin
if found()
   wwnprov=rtrim(e.nombre)
   wprov=e.prov
else   
   wwnprov=space(10)
   wprov=0
endif
wdomtip=0
if a.tipo=1
   wdomtip=1
endif   
@10,18 say a.domici
@11,18 say wwnloc
@11,41 say wwndpto
@11,63 say wwnprov
@10,60 say a.telef
if wdomtip=1
   @11,01 say 'Domicilio no actualizado'
endif
wsiga='S'
@12,01 clear to 23,78
wind=1
@12,01 say wlin1
@13,01 say wlin2a
*@13,16 say wtitdesc
@13,48 say wnombre
@14,01 say wlin3a
@14,12 say wmatric pict '99999'
*@14,18 say wlin3b
@14,25 say wcatego
@14,29 say wlin3c
*@15,01 say wlin4a
@15,04 say winscr
if wcondic < '2' 
   if whabili > 1999 
      @15,15 say wlin4b
   else
      if whabili = 1999
         @15,15 say wlin7b
         @16,01 say wlin7c
         @16,48 say '2000 '
      else
   	     @16,01 say wlin7f
   	     @17,01 say wlin7g
   	     wmatdes=whabili+1
   	     @17,26 say wmatdes pict '9999'
   	     @17,30 say ' a '
   	     @17,33 say '2000 '
   	     @17,65 say wlin7ha
      endif
   endif
else
   if wcondic = 'C'
      @15,13 say wlin7ba
      @16,01 say wlin7i
   else
      if wcondic = 'F'
         @15,13 say wlin7ba
         @16,01 say wlin7j
      else
         if wcondic = 'S'
            @15,13 say wlin7ba
            @16,01 say wlin7k
         else
            if wcondic = '5'
               @15,13 say wlin7ba
               @16,01 say wlin7l
            endif   
         endif   
      endif   
   endif
endif
@18,01 say wlin6a
@19,01 say a.domici
@19,46 say wwnloc
@19,60 say wwndpto
@20,46 say wwnprov
@20,60 say a.telef
if wdomtip = 1
   @21,15 say 'Domicilio NO actualizado ' color n/w*
endif
if wisanc = 0
   @09,17 say ' No existen sanciones '
else
   @09,17 say '    existen sanciones '
endif
if wirest = 0
	@9,40  say 'No existen restricciones'
else
	@9,40  say '   EXISTEN Restricciones'	      
endif	
*wlin=10
*     mostrar por pantalla lo encontrado para confirmar
*     imprimir o salir.
wop3=1
@23,01 get wop3 pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop3 = 2
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   ? chr(27)+chr(77)
   ?? wlin1
   ?
   ?wlin2a
   ?? ', '
   ?? wnombre
   ?
   ? wlin3a
   ?? wmatric pict '99999' at 10
   ?? wlin3c at 16
   ?
   ? winscr 
   if wcondic = 'A' or wcondic < '2' 
      if whabili > 1999 
         ?? wlin4b at 10
         ?? '2000.-'
         ?
      else
         if whabili = 1999
            ?? wlin7b at 10
            ?
            ?  wlin7c
            ?? '2000 ' at 22
            ?
         else
   	        ?? wlin7f at 10
   	        ?
   	        ? wlin7g
   	        wmatdes=whabili+1
   	        ??  wmatdes pict '9999' at 27
   	        ??  wlin7h at 31
   	        ?? '2000 ' at 34
   	        ?? wlin7ha at 38
		    ?
         endif
      endif
   else
      if wcondic = '2' or wcondic = 'C'
         ??  wlin7ba at 14
         ?   wlin7i
      else
         if wcondic = '3' or wcondic = 'F'
            ??  wlin7ba at 14
            ?   wlin7j
         else
            if wcondic = '4' or wcondic = 'S'
               ?? wlin7ba at 14
               ?  wlin7k
            else
               if wcondic = '5'
                  ?? wlin7ba at 14
                  ?  wlin7l
               endif   
            endif   
         endif   
      endif
   endif
   ? wlin6a
   ?
   ? rtrim(a.domici)
   ?? '  '
   if wwnloc<> space(15)
      ?? wwnloc
   endif
   if wwndpto<> space(15)
      ?? wwndpto
   endif
   ?? wwnprov
   ?? ' '
   ?? a.telef
   ?   
*   endif
   if wisanc = 0
      ? wlin5a
      ?
   *   @09,17 say ' No existen sanciones '
   else
      windsan=1
      ? wlin8a
      ? chr(27)+chr(80)
      ?? chr(15)
      ?? wlin8sa
      do while wsanreso(windsan)<> 99999
         if wsantipo(windsan)= '1'
            ?'L.3485-Art.34 '
            ??wsaninci(windsan) pict 'x'
            if wsaninci(windsan)= 'a' or wsaninci(windsan)='A'
               ?? ' Advertencia     '
            else
               if wsaninci(windsan)='b' or wsaninci(windsan)='B'
                  ?? ' Amonestaci¢n     '
               else
                  if wsaninci(windsan)='c' or wsaninci(windsan)='C'
                     ?? ' Multa           '
                  else
                     if wsaninci(windsan)='d' or wsaninci(windsan)='D'
                        ?? ' Multa/Censura P.'
                     else
                        if wsaninci(windsan)='e' or wsaninci(windsan)='E'
                           ?? ' Suspensi¢n     '
                        else
                           if wsaninci(windsan)='f' or wsaninci(windsan)='F'
                              ?? ' Cancelaci¢n Matr.'
                           endif   
                        endif   
                     endif
                  endif   
               endif
            endif
            ?? wsanreso(windsan) pict '9999'
            ?? ' '
            ?? wsanfere(windsan)
            ?? ' '
            ?? wsanvigd(windsan)
            ?? ' '
            ?? wsanvigh(windsan)
            ?? ' '
            ?? wsancnma(windsan) pict '999'
            ?? ' '
            if wsancpag(windsan)<>1
               ?? 'Pendiente '
            else
               ?? wsanfpag(windsan)
            endif
               ?? wsanobs(windsan)
         else
              if wsantipo(windsan)='2'
               ?'Cod.Etica Art.34 '
               ??wsaninci(windsan) pict 'x'
               if wsaninci(windsan)= 'a' or wsaninci(windsan)='A'
                  ?? ' Advertencia     '
               else
                  if wsaninci(windsan)='b' or wsaninci(windsan)='B'
                     ?? ' Amonestaci¢n    '
                  else
                     if wsaninci(windsan)='c' or wsaninci(windsan)='C'
                        ?? ' Suspensi¢n      '
                     else
                        if wsaninci(windsan)='d' or wsaninci(windsan)='D'
                           ?? ' Suspensi¢n      '
                        else
                           if wsaninci(windsan)='e' or wsaninci(windsan)='E'
                              ?? ' Suspensi¢n/Canc.Matr.'
                           endif
                        endif
                     endif
                  endif
               endif               
               ?? wsanreso(windsan) pict '9999'
               ?? ' '
               ?? wsanfere(windsan)
               ?? ' '
               ?? wsanvigd(windsan)
               ?? ' '
               ?? wsanvigh(windsan)
               ?? ' '
               if wsancpag(windsan)<>1
                  ?? 'Pendiente '
               else
                  ?? 'Cumplida '      
               endif
               ?? wsanobs(windsan)
               else
                  if wsantipo(windsan)='3'
                     ?'L.3485-Art.32  '
                     ?? '  Multa           '
                     ?? wsanreso(windsan) pict '9999'
                     ?? ' '
                     ?? wsanfere(windsan)
                     ?? ' '
                     ?? wsanvigd(windsan)
                     ?? ' '
                  ?? wsanvigh(windsan)
                  ?? ' '
                  ?? wsancnma(windsan) pict '999'
                  ?? ' '
                  if wsancpag(windsan)<>1
                     ?? 'Pendiente '
                  else
                    ?? wsanfpag(windsan)
                  endif
                  ?? wsanobs(windsan)
               else
                  if wsantipo(windsan)='4'
                     ?'L.3485-Art.33  '
                     ?? '  Multa           '
                     ?? wsanreso(windsan) pict '9999'
                     ?? ' '
                     ?? wsanfere(windsan)
                     ?? ' '
                     ?? wsanvigd(windsan)
                     ?? ' '
                     ?? wsanvigh(windsan)
                     ?? ' '
                     ?? wsancnma(windsan) pict '999'
                     ?? ' '
                     if wsancpag(windsan)<>1
                        ?? 'Pendiente '
                     else
                       ?? wsanfpag(windsan)
                     endif
                     ?? wsanobs(windsan)
                  else
                     if wsantipo(windsan)='5'
                        ?'L.5908 - Art.46 '
                        ?? '  Suspensi¢n      '
                        ?? wsanreso(windsan) pict '9999'
                        ?? ' '
                        ?? wsanfere(windsan)
                        ?? ' '
                        ?? wsanvigd(windsan)
                        ?? ' '
                        ?? wsanvigh(windsan)
                        ?? '    '
   *                     ?? wsancnma(windsan) pict '999'
   *                     ?? ' '
                        if wsancpag(windsan)<>1
                           ?? 'Pendiente '
                        else
                          ??  'Cumplida  '  
                        endif
                        ?? wsanobs(windsan)
                     endif
                  endif
               endif
            endif
         endif
         windsan=windsan+1 
*      @09,17 say '    existen sanciones '
      enddo
      ?? chr(18)
      ?? chr(27)+chr(77)
   endif
   if wirest = 0
   *    ? wlinxx
   *	@9,40  say 'No existen restricciones'
   else
      windres=1
       ? wlin9a
       ? chr(27)+chr(80)
       ?? chr(15)
       do while wrstipo(windres)<>'99999'
          ? wrstipo(windres)
          ?? ' '
          ?? wrstobs(windres)
          ?? ' '
          ?? wrstori(windres)
          ?? ' '
          ?? wrstfac(windres)
          ?? ' '
          ?? wrstpag(windres)
          ?? ' '
          ?? wrstimp(windres)
          ?? ' '
          ?? wrstotr(windres)
          windres=windres+1
       enddo
       ?? chr(18)
       ?? chr(27)+chr(80)   
*     	@9,40  say '   EXISTEN Restricciones'	      
   endif
   ?chr(27)+chr(77)
   do buscarep
   ?
   ?'                                Mendoza,   de           de'
   ??chr(27)+chr(80)	
   eject
endif   
set printer off
set device to screen            	     
return


procedure panta11
@05,01 clear to 23,78
*@05,02 say "T¡tulo      :"
*@06,02 say "Otorgado por:"
@07,02 say "Habilitado  :"
@08,02 say "Estado      :"
@09,02 say "Sancion     :"
*@07,35 say "Cursos      :"
@10,02 say "Domicilio   :"
return

*procedure graba
*select 7
* append blank
*return



procedure buscarst
parameter  wmatric, wcateg
select 9
use sprestri index sprestri
@23,01 clear to 23,78
@23,01 say 'Oprima <ESC> para salir'
define window prest from 10,05 to 22,75 title 'Restricciones'
activate window prest
browse fields restrtipo:H='Tipo',observac:H='Observ.',restforig:H='F.Orig.',restimpo:H='Importe',;
			  restfactu:H='F.Vto.',restfpago:H='F.Pago';
		for matric=wmatric and catego=wcateg and restrotr = 0 in prest
deactivate window prest
@23,01 clear to 23,78
return		

procedure ingrsan

*select 9
*use sptsanin index sptasin
*append blank
wsantipo(windsan)=santipo
wsaninci(windsan)=saninci
wsanfere(windsan)=sanferes
wsanreso(windsan)=sanresol
wsanvigd(windsan)=sanvigde
wsanvigh(windsan)=sanvigha
wsancnma(windsan)=sancnmat
wsancpag(windsan)=sancpag
wsanfpag(windsan)=sanfpag
wsanobs(windsan)=sanobs
wisanc=1
windsan=windsan+1
wsanreso(windsan)=99999
return

procedure ingrest
*select 9
*use sptresin index sptresin
*append blank
wrstipo(windres)=restrtipo
wrstobs(windres)=observac
wrstori(windres)=restforig
wrstfac(windres)=restfactu
wrstpag(windres)=restfpago
wrstimp(windres)=restimpo
wrstotr(windres)=restrotr
wirest=1
windres=windres+1
wrstipo(windres)='99999'
return

procedure ponetit
@13,01 clear to 20,78
@13,01 say 'T.In.Resol. Fecha   D.  Vigencia  H'
@13,37 say 'Mat.Cgo.F.Pago  Recibo  Observac.'
@19,01 say '1- Sanc.Ley 3485 Art.34        5- Art.46 Ley 5908'
@20,01 say '2- Sanc.Faltas Cod. Etica      6- Otros'
@21,01 say '3- Sanc. Art.32 Ley 3485'
@22,01 say '4- Sanc. Art.33 Ley 3485'
return

procedure limpia
@13,01 clear to 21,78
return

procedure buscarep
wrtsigue='S'
wrtfecha={  /  /  }
wrtfechf={  /  /  }
wrtcpto=space(1)
wrtmat=0
wrtcat=space(2)
wrtnom=space(30)
wrttit=space(30)
wkeyrt=space(7)
wkeyrt1=space(9)
wsetit=0
select 7
use sprtcos order empresa
go top
locate for str(empresa,5)=str(wmatric,5)
do while found()
   if wsetit=0
      ?wlin13
      ?wlin14
      ?
      wsetit=1
   endif
   ??chr(15)   
   wrtnomb=space(30)
   wrttit=space(30)
   wkeyrt=str(matprof,5)+categor
   wrtvinc=rtvinculo
   wrtmat=matprof
   wrtcat=categor
   wrtfecha=rtinicio
   wrtfechf=rtfinal
   select 8
   use spmatri index spmatri
   seek(wkeyrt)
   wsert=0
   if found()
      select 3 
      use sptitu order titulo
      select 8
      set relation to titulo into sptitu
      wrttit=c.titdesc
      wkeyrt1=str(dctipo,1)+str(dcnro,8)
      select 6
      use spprof index spprof
      seek(wkeyrt1)
      if found()
         wrtnomb=nombre
         wsert=1
      endif
   endif
   if wsert= 1
      ? wrttit
      ??' '
      ?? wrtnomb
      ??'   '
      ?? wrtmat pict '9999'
      ??' '
      ??wrtcat
      ??'         '
      if wrtvinc = 1
         ?? 'Contrato '
      else
         if wrtvinc = 2
            ?? 'Socio   '
         else
            if wrtvinc = 3
               ?? 'Rel.Depend.'
            else
               if wrtvinc = 4
                  ?? 'Gerente '
               else
                  if wrtvinc = 5
                     ?? 'Apoderado'
                  else
                     if wrtvinc = 6
                        ?? 'Por Obra '
                     else
                        if wrtvinc = 7
                           ?? 'Contr.Ren.Aut.'
                        else
                           if wrtvinc = 8
                              ?? 'Propietario'
                           else
                              if wrtvinc = 9
                                 ?? "Contrato Renov.Aut."
                              else
                                 if wrtvinc = 10
                                    ?? "Desconocido"
                                 else
                                    if wrtvinc = 11
                                       ?? 'Contr.sin Vto.'
                                    endif   
                                 endif      
                              endif
                           endif
                        endif
                     endif
                  endif
               endif
            endif
         endif
      endif
      ?? wrtfecha at 101
      ?? wrtfechf at 112
      ?
   endif
   ??chr(18)   
   select 7
   continue
enddo
return      
       