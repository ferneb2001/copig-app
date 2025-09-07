procedure sp002
**Menu Administracion II del Sistema del Consejo Profesional
**de Ingenieros y Geologos - Mendoza
CLEAR
SET EXCLUSIVE OFF
seT DELETED ON
close all
SET DEVICE TO SCREEN
SET TALK OFF
SET REPROCESS TO AUTOMATIC
set date dmy
WFCONT=2449345
*if val(sys(1))<wfcont
   fup=CHR(24)
   fdw=CHR(25)
   *select 1
   *use carpar
   *WUSU=rtrim(usuario)
    DEFINE MENU pant2_01 
    DEFINE PAD actualiza     OF pant2_01 PROMPT "\<Actualizaci¢n" at 04,01
*   DEFINE PAD listados      OF pant2_01 PROMPT "\<Listados" AT 04,17
*   DEFINE PAD consultas     OF pant2_01 PROMPT "\<Consultas" AT 04,28
*   define pad backups       of pant2_01 prompt "Clasif.\<Seguridad" at 04,40
*   define pad certif        of pant2_01 prompt 'C\<ertificados' at 04,59
   do pi2e
   USE
   SET DATE FRENCH
   @02,70 SAY DATE()

   ON SELECTION PAD actualiza OF pant2_01 ACTIVATE POPUP actual 
   DEFINE POPUP actual      FROM 6,01 TITLE "Actualiza II "
   DEFINE BAR  1 OF actual   PROMPT "\<Informe Registro Prof. "
   DEFINE BAR  2 OF actual   PROMPT '\<Empresas, Informe R.P. '
   define bar  3 of actual   PROMPT '\<Restricciones a No Inscriptos'
   define bar  4 of actual   prompt "\<Profesionales otras Ramas"
   define bar  5 of actual   prompt "\<Certificados Profesionales"
   define bar  6 of actual   prompt "Certificados \<Empresas     "        
*   define bar  7 of actual   prompt "\<T‚cnicos en Hig. y Seg."        
*   define bar  8 of actual   prompt "\<Entidades Educativas"    
*   define bar  9 of actual   prompt "\<Incumbencias"        
*   define bar 10 of actual   prompt '\<N£meros de Documentos'
*   define bar 11 of actual   prompt "\<Matr¡culas Empresas"
*   define bar 12 of actual   prompt '\<Universidades'
*   define bar 13 of actual   prompt '\<A Restricciones/deudas'
*   define bar 14 of actual   prompt 'N\<otificaciones a Empresas'
*   define bar 15 of actual   prompt '\<Z Sanciones a no profesionales'
*   define bar 16 of actual   prompt '\<X Sanciones a empresas'
*   define bar 17 of actual   prompt '\<Y Modifica Domicilios solam.'
   ON SELECTION POPUP actual  do sp2aa with popup(), bar()

*   ON SELECTION PAD consultas OF pant2_01 ACTIVATE POPUP consul 
*   DEFINE POPUP consul      FROM 6,28 TITLE "Consultas"
*   DEFINE BAR 1 OF consul   PROMPT "\<Profesionales/Matriculas"
*   DEFINE BAR 2 OF consul   PROMPT '\<Localidad, Dptos'
*   define bar 3 of consul   prompt "\<Sanciones"        
*   define bar 4 of consul   prompt "\<Cursos post-grado"        
*   define bar 5 of consul   prompt "\<Representantes T‚cnicos"        
*   define bar 6 of consul   prompt "\<Titulos"        
*   define bar 7 of consul   prompt "\<Entidades Educativas"    
*   define bar 8 of consul   prompt "\<Incumbencias"
*   define bar 9 of consul   prompt "\<Matr¡culas Empresas"        
*   define bar 10 of consul  prompt "N\<otificaciones Empresas"
*   define bar 11 of consul  prompt "\<Z Sanciones a no profesionales"
*   define bar 12 of consul  prompt '\<X Sanciones a Empresas'
*   ON SELECTION POPUP consul  do spac with popup(), bar()

     
*   ON SELECTION PAD listados  OF pant2_01 ACTIVATE POPUP lista
*   DEFINE POPUP lista       FROM 6,17 TITLE "Listados"
*   DEFINE BAR 1 OF lista    PROMPT "\<Profesionales"
*   define bar 2 of lista    prompt "\<Titulos"
*   define bar 3 of lista    prompt "\<Curso"
*   define bar 4 of lista    prompt "\<Empresas"
*   define bar 5 of lista    prompt "\<Departamentos"
*   define bar 6 of lista    prompt "\<Localidades"
*   define bar 7 of lista    prompt "E\<ntidades Educativas"
*   define bar 8 of lista    prompt "N\<otificaciones"
*   define bar 9 of lista    prompt "\<Representantes Tcos."
*   define bar 10 of lista   prompt '\<A Restricciones/deudas'
*   define bar 11 of lista   prompt '\<Sanciones'
*   define bar 12 of lista   prompt 'Not\<ificaciones Empresas'
*   define bar 13 of lista   prompt '\<Z Sanciones a no profes.'
*   define bar 14 of lista   prompt '\<X Sanciones a Empresas'
*   define bar 15 of lista   prompt '\<B Informe de Notificac.'
*   ON SELECTION POPUP lista   do spal with popup(), bar()

*   on selection pad backups OF pant2_01 activate popup clasi
*   define popup clasi       from 6,40 title 'CLASIFIC/COP'
*   define bar 1 of clasi    prompt '\<Clasifica'
*   on selection popup clasi do spbac with popup(), bar()

*    on selection pad certif of pant2_01 activate popup certi
*   define popup certi       from 06,59 title 'CERTIFICADOS'
*   define bar 1 of certi    prompt '\<Nuevo Ingreso'
*   define bar 2 of certi    prompt 'L\<istado nuevo'
*   define bar 3 of certi    prompt 'C\<onsulta nuevo'
*   define bar 4 of certi    prompt 'C\<lasifica nuevo'
*   define bar 5 of certi    prompt '\<Reimprime certificaci¢n'
*   define bar 6 of certi    prompt '\<Estadisticas'
*   define bar 7 of certi    prompt '\<Consultas 94/95'
*   define bar 8 of certi    prompt 'E\<stadisticas 94/95'
*   define bar 9 of certi    prompt 'Lis\<tado 94/95     '
*   define bar 10 of certi   prompt 'Re\<imprime certif. 94/95 '
*   on selection popup certi do spae with popup(), bar()

   ACTIVATE MENU pant2_01
   clear
*endif
return
procedure pi2e
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'CONSEJO PROF.DE INGENIEROS Y GEOLOGOS'
@02,50 Say 'ADMINISTRACION II' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

